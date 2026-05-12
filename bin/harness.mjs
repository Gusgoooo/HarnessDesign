#!/usr/bin/env node
import { resolve, join, relative, sep } from "node:path";
import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createConnection } from "node:net";
import { createHash } from "node:crypto";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PKG_ROOT = resolve(__dirname, "..");

const [, , cmd, ...rest] = process.argv;

/** 消费者项目中的组件库根目录：隐藏目录，与业务 `src/` 分离；治理文件在 `.cursor/` */
const DEFAULT_HARNESS_DIR = ".harness";

const PORTAL_PATH = "/?path=/docs/designtoken--docs";
const DEFAULT_PORT = 6006;

const MANIFEST_FILE = ".design-kit-manifest.json";
const KIT_STATUS_FILE = ".storybook/kit-status.json";

/**
 * Reference Policy — 决定「被引用」的含义与侧栏圆点语义。
 *
 * 引用扫描范围：
 *   scan:    **\/*.{ts,tsx,js,jsx}
 *   exclude: **\/*.stories.*, node_modules/**
 *   即：仅生产/业务代码的 import 算「被引用」；stories 内的引用不算。
 *
 * 圆点语义（侧栏组件行右侧）：
 *   蓝色 #3b82f6  = NEW     该组件由本次 kit sync/upgrade 新增
 *   琥珀 #f59e0b  = MODIFIED 用户已在本地修改过（hash 与 kit 基准不同）
 *   无圆点        = UNCHANGED 与 kit 基准一致，或非 kit 管理文件
 *
 * 升级策略（harness upgrade）：
 *   1. 新增路径（kit 有、本地无） → 直接拷贝
 *   2. 未修改路径（本地 hash = kitHash）→ 覆盖为新版
 *   3. 已修改路径（本地 hash ≠ kitHash）→ 跳过，打印日志
 */
const REFERENCE_POLICY = {
  scanGlobs: ["**/*.{ts,tsx,js,jsx}"],
  excludeGlobs: ["**/*.stories.*", "node_modules/**"],
  dotColors: {
    new: "#3b82f6",
    modified: "#f59e0b",
  },
};

const HELP = `
harness — 组件库管理工具

说明:
  默认在**当前项目根**下创建隐藏目录 ${DEFAULT_HARNESS_DIR}/（组件库 + Storybook），
  并在 .cursor/ 写入规则与 MCP；不在业务树里创建 harness-ui 等显式文件夹。
  业务应用代码仍放在项目自有的 src/；组件库仅在 ${DEFAULT_HARNESS_DIR}/ 内维护。

用法:
  harness start [目标目录]    一键启动（init + install + 打开 Portal）— 设计师推荐
  harness init  [目标目录]    初始化组件库（默认 ./${DEFAULT_HARNESS_DIR}）
  harness govern              治理模式：仅注入 AI 规则文件，不拷贝组件/CSS（适合已有项目）
  harness upgrade [目标目录]  升级 kit：新增组件直接加入、未修改覆盖、已修改跳过
  harness dev   [目标目录]    启动 Storybook 并自动打开 Portal 页面
  harness mcp   [目标目录]    启动 MCP Server（供 Cursor Agent 使用）
  harness sync  [目标目录]    同步 schema → Tailwind + .cursorrules + 规则镜像
  harness audit [目标目录]    运行合规审计（检测禁止标签 + 任意值 Tailwind）
  harness help                显示帮助
`.trim();

switch (cmd) {
  case "start":
    doStart(rest[0]);
    break;
  case "init":
    doInit(rest[0]);
    break;
  case "govern":
    doGovern();
    break;
  case "upgrade":
    doUpgrade(rest[0]);
    break;
  case "dev":
    doDev(rest[0]);
    break;
  case "mcp":
    doMcp(rest[0]);
    break;
  case "sync":
    doSync(rest[0]);
    break;
  case "audit":
    doAudit(rest[0]);
    break;
  case "help":
  case "--help":
  case "-h":
  case undefined:
    console.log(HELP);
    break;
  default:
    console.error(`未知命令: ${cmd}\n`);
    console.log(HELP);
    process.exit(1);
}

/* ─── manifest helpers ─── */

function fileHash(absPath) {
  return createHash("sha256").update(readFileSync(absPath)).digest("hex").slice(0, 16);
}

/** Files the kit manages (non-stories source under toCopy dirs). */
function collectKitFiles(kitRoot) {
  const entries = [];
  const dirs = ["src/components", "src/design-tokens", "src/styles", "src/lib", ".storybook"];
  for (const dir of dirs) {
    const abs = join(kitRoot, dir);
    if (!existsSync(abs)) continue;
    walkDir(abs, (filePath) => {
      const rel = relative(kitRoot, filePath).split(sep).join("/");
      entries.push(rel);
    });
  }
  return entries;
}

function walkDir(dir, cb) {
  for (const ent of readdirSyncSafe(dir)) {
    const p = join(dir, ent);
    try {
      const st = statSync(p);
      if (st.isDirectory()) walkDir(p, cb);
      else cb(p);
    } catch { /* skip unreadable */ }
  }
}

function readManifest(target) {
  const p = join(target, MANIFEST_FILE);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
}

function writeManifest(target, manifest) {
  writeFileSync(join(target, MANIFEST_FILE), JSON.stringify(manifest, null, 2) + "\n");
}

function buildManifest(target, kitVersion) {
  const files = {};
  const kitFiles = collectKitFiles(PKG_ROOT);
  for (const rel of kitFiles) {
    const local = join(target, rel);
    if (!existsSync(local)) continue;
    files[rel] = { kitHash: fileHash(local), status: "unchanged" };
  }
  return {
    kitPackage: "harness-design",
    kitVersion,
    syncedAt: new Date().toISOString(),
    referencePolicy: REFERENCE_POLICY,
    files,
  };
}

/**
 * Derive component-level status from file-level manifest for Storybook sidebar.
 * Maps component display names to { status: "new" | "modified" | "unchanged" }.
 */
function buildKitStatus(manifest) {
  const components = {};
  for (const [rel, info] of Object.entries(manifest.files ?? {})) {
    const m = rel.match(/^src\/components\/starter\/([^/]+)\.tsx$/);
    if (!m) continue;
    const fileName = m[1];
    if (fileName.includes(".stories")) continue;
    const name = fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const prev = components[name];
    if (!prev || statusPriority(info.status) > statusPriority(prev.status)) {
      components[name] = { status: info.status, file: rel };
    }
  }
  return {
    kitVersion: manifest.kitVersion,
    syncedAt: manifest.syncedAt,
    dotColors: REFERENCE_POLICY.dotColors,
    components,
  };
}

function statusPriority(s) {
  return s === "new" ? 2 : s === "modified" ? 1 : 0;
}

function writeKitStatus(target, manifest) {
  const status = buildKitStatus(manifest);
  const dir = join(target, ".storybook");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(target, KIT_STATUS_FILE), JSON.stringify(status, null, 2) + "\n");
}

/* ─── init ─── */

function doInit(targetArg) {
  const target = resolve(process.cwd(), targetArg || DEFAULT_HARNESS_DIR);
  console.log(`\n📦 初始化组件库到 ${target}\n`);

  if (existsSync(join(target, "package.json"))) {
    console.log("⚠️  目标目录已存在 package.json，跳过 scaffold（使用 harness dev 启动）");
    const projectRoot = resolve(target, "..");
    writeHarnessConsumerDocs(projectRoot, target);
    generateCursorRule(projectRoot, target);
    return;
  }

  mkdirSync(target, { recursive: true });

  const toCopy = [
    "src/components",
    "src/design-tokens",
    "src/styles",
    "src/lib",
    ".storybook",
    "vite-plugin-schema-api.mjs",
    "tsconfig.json",
    "tailwind.config.ts",
    "tailwind.harness.generated.ts",
  ];

  for (const rel of toCopy) {
    const src = join(PKG_ROOT, rel);
    const dst = join(target, rel);
    if (!existsSync(src)) continue;
    cpSync(src, dst, { recursive: true });
    console.log(`  ✅ ${rel}`);
  }

  // 如果有 harness schema 目录也拷贝
  const schemaDir = join(PKG_ROOT, "src/harness");
  if (existsSync(schemaDir)) {
    cpSync(schemaDir, join(target, "src/harness"), { recursive: true });
    console.log("  ✅ src/harness");
  }

  // 设计门户（Schema 可视化）仅保留在 Harness 产品仓库；init 出的消费者项目不包含，避免在项目 A 里「强行塞」一套独立编辑产品。

  // 拷贝 scripts
  const scriptsDir = join(PKG_ROOT, "scripts");
  if (existsSync(scriptsDir)) {
    cpSync(scriptsDir, join(target, "scripts"), { recursive: true });
    console.log("  ✅ scripts");
  }

  // 生成 package.json（react / react-dom 用 peer + dev，减轻与业务项目双 React 冲突）
  const parentPkg = readPkgJson(PKG_ROOT);
  const { dependencies, peerDependencies, devDependencies } = buildScaffoldPackageJson(parentPkg);
  const pkg = {
    name: "harness-local",
    version: "0.1.0",
    private: true,
    type: "module",
    main: "index.ts",
    scripts: {
      "sync:tokens": parentPkg.scripts?.["sync:tokens"] || "node scripts/emit-design-tokens-css.mjs",
      "sync:harness": parentPkg.scripts?.["sync:harness"] || "npm run sync:tokens && node scripts/sync-from-schema.mjs",
      "harness:audit": parentPkg.scripts?.["harness:audit"] || "node scripts/harness-audit.mjs",
      storybook: "storybook dev -p 6006",
      "build-storybook": "storybook build",
      typecheck: "tsc --noEmit",
    },
    dependencies,
    peerDependencies,
    devDependencies,
  };
  if (!Object.keys(pkg.peerDependencies).length) delete pkg.peerDependencies;
  writeFileSync(join(target, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  console.log("  ✅ package.json");

  // 生成组件入口 index.ts
  generateIndex(target);

  // 生成 manifest + kit status（供 upgrade 和侧栏圆点使用）
  const kitVersion = parentPkg.version || "0.0.0";
  const manifest = buildManifest(target, kitVersion);
  writeManifest(target, manifest);
  writeKitStatus(target, manifest);
  console.log("  ✅ .design-kit-manifest.json + .storybook/kit-status.json");

  // 生成 Cursor 集成文件（写到用户项目根目录）
  const projectRoot = resolve(target, "..");
  generateCursorRule(projectRoot, target);
  generateCursorMcp(projectRoot, target);
  generateAgentsMd(projectRoot, target);
  installCursorHooks(projectRoot);
  installSelfcheckRule(projectRoot);
  writeHarnessConsumerDocs(projectRoot, target);

  console.log("\n📦 scaffold 完成！\n");
  console.log("后续步骤：");
  console.log(`  cd ${targetArg || DEFAULT_HARNESS_DIR}`);
  console.log("  npm install");
  console.log("  harness dev .");
  console.log("");
  console.log("🤖 Cursor 集成已自动配置：");
  console.log("  • .cursor/rules/harness.mdc       — 组件库约束（alwaysApply）");
  console.log("  • .cursor/rules/harness-selfcheck.mdc — 改完代码后的自检清单");
  console.log("  • .cursor/mcp.json                — MCP Server");
  console.log("  • .cursor/hooks.json              — 保存 .tsx 后自动跑 harness audit");
  console.log("  • HARNESS_BOUNDARIES.md            — 目录边界说明（业务 src vs .harness）");
  console.log("  • HARNESS_INTEGRATION.md           — @design 别名与 Vite 示例");
  console.log("  重新打开 Cursor 后 Hooks 与规则生效。\n");
}

/**
 * 脚手架 package.json：将 react / react-dom 从 dependencies 挪到 peerDependencies，
 * 并在 devDependencies 中保留同版本供 Storybook 本地开发解析。
 */
function buildScaffoldPackageJson(parentPkg) {
  const deps = { ...(parentPkg.dependencies || {}) };
  const peer = {};
  for (const key of ["react", "react-dom"]) {
    if (deps[key] != null) {
      peer[key] = deps[key];
      delete deps[key];
    }
  }
  const devDeps = { ...(parentPkg.devDependencies || {}) };
  for (const key of ["react", "react-dom"]) {
    if (peer[key] != null && devDeps[key] == null) {
      devDeps[key] = peer[key];
    }
  }
  return {
    dependencies: deps,
    peerDependencies: peer,
    devDependencies: devDeps,
  };
}

/** 项目根：边界说明 + import 别名集成（立刻可做的「一页纸」） */
function writeHarnessConsumerDocs(projectRoot, libTarget) {
  const relLib = "./" + relative(projectRoot, libTarget).split(sep).join("/");
  const boundariesSrc = join(PKG_ROOT, "docs", "BOUNDARIES.md");
  const boundariesDst = join(projectRoot, "HARNESS_BOUNDARIES.md");
  if (existsSync(boundariesSrc)) {
    cpSync(boundariesSrc, boundariesDst);
    console.log("  ✅ HARNESS_BOUNDARIES.md（项目根）");
  }

  const integration = `# Harness 与业务项目集成（import 别名）

组件库物理路径：\`${relLib}/\`（一般为 \`./.harness/\`）。业务代码请放在项目自有的 \`src/\`，详见同目录 **HARNESS_BOUNDARIES.md**。

## 推荐：TypeScript \`paths\` — \`@design\`

在**业务项目**的 \`tsconfig.json\` 的 \`compilerOptions.paths\` 中合并（路径按你仓库结构调整）：

\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "@design": ["${relLib}/index.ts"]
    }
  }
}
\`\`\`

业务中写法示例：

\`\`\`tsx
import { DataTable, Button } from "@design";
\`\`\`

> 若项目已将 \`@\` 映射到业务 \`src/\`，请勿与 \`@design\` 混用同一前缀；保持 \`@design\` 仅指向 Harness barrel。

## Vite / Rspack 等：\`resolve.alias\`

\`\`\`ts
import path from "node:path";
// vite.config.ts
export default {
  resolve: {
    alias: {
      "@design": path.resolve(__dirname, "${relLib}/index.ts"),
    },
  },
};
\`\`\`

## 无别名时

使用相对路径，例如从 \`src/pages/Foo.tsx\` 导入：

\`\`\`tsx
import { Button } from "${relLib}/index.ts";
\`\`\`

（具体相对路径以文件位置为准。）

---
*由 \`harness init\` 生成；修改别名后无需改本文件，以业务侧 tsconfig / Vite 为准。*
`;
  writeFileSync(join(projectRoot, "HARNESS_INTEGRATION.md"), integration);
  console.log("  ✅ HARNESS_INTEGRATION.md（项目根）");
}

function readPkgJson(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  } catch {
    return {};
  }
}

function generateIndex(target) {
  const compsDir = join(target, "src/components");
  if (!existsSync(compsDir)) return;

  const lines = [
    "// Auto-generated — 组件库统一入口（位于项目根隐藏目录 .harness/）",
    '// 业务项目: import { ... } from "./.harness" 或为 .harness 配置 TS path 别名',
    "",
  ];

  // starter 组件
  const starterDir = join(compsDir, "starter");
  if (existsSync(starterDir)) {
    const files = readdirSyncSafe(starterDir).filter(f => f.endsWith(".tsx") && !f.includes(".stories."));
    for (const f of files) {
      const mod = f.replace(/\.tsx$/, "");
      lines.push(`export * from "./src/components/starter/${mod}";`);
    }
  }


  writeFileSync(join(target, "index.ts"), lines.join("\n") + "\n");
  console.log("  ✅ index.ts（组件统一入口）");
}

function readdirSyncSafe(dir) {
  try { return readdirSync(dir); }
  catch { return []; }
}

/* ─── Cursor 集成 ─── */

function generateCursorRule(projectRoot, libTarget) {
  const relLib = "./" + relative(projectRoot, libTarget).split(sep).join("/");
  const rulesDir = join(projectRoot, ".cursor/rules");
  mkdirSync(rulesDir, { recursive: true });

  const specDir = join(libTarget, "src/harness/schema/components");
  let specSummary = "";
  if (existsSync(specDir)) {
    const files = readdirSync(specDir).filter(f => f.endsWith(".spec.json"));
    for (const f of files) {
      try {
        const s = JSON.parse(readFileSync(join(specDir, f), "utf8"));
        specSummary += `- **${s.componentName}**: ${s.intent}\n`;
      } catch {}
    }
  }

  const rule = `---
description: Harness 组件库规范 — AI 必须遵守的组件使用约束
alwaysApply: true
---

# Harness 组件库规范

本项目使用 Harness 组件库（位于 \`${relLib}\`，一般为隐藏目录 \`./.harness\`），所有 UI 开发必须遵守以下规范。

## 目录约定

- **应用 / 业务页面**：写在项目自有的 \`src/\`（或你项目原有的应用目录），**不要**把业务页面、路由、feature 代码写进 \`${relLib}\`。
- **组件库与 Design Token**：仅在 \`${relLib}\` 内维护；Harness 通过 \`${relLib}\` 与 \`.cursor/\` 注入能力，不替代你项目本身的文件夹结构。

## 组件引用规则

1. **禁止使用原生 HTML 标签**：\`<button>\`、\`<input>\`、\`<table>\` 等，必须使用业务组件
2. **导入路径**：**优先**使用已在业务 \`tsconfig\` / Vite 中配置的 **\`@design\`**（见项目根 \`HARNESS_INTEGRATION.md\`）；否则从 \`${relLib}/src/components/starter/\` 导入
3. **禁止手写间距**：不允许 \`m-[13px]\`、\`p-[7px]\` 等任意值 Tailwind 类
4. **颜色仅用语义类**：\`bg-primary\`、\`text-muted-foreground\` 等，禁止硬编码色值

## 可用组件

${specSummary || "（运行 harness sync 后自动生成）"}

## 组件规范（JSON，非独立「Schema 编辑器」产品）

规范文件在 \`${relLib}/src/harness/schema/components/*.spec.json\`。在 IDE 里直接改 JSON 即可；改完后在 \`${relLib}\` 下执行 \`npm run sync:harness\`（或 \`harness sync .\`）生成 \`.cursorrules\` 与 Tailwind 生成物。

## MCP 工具（若已配置 .cursor/mcp.json）

按需使用，例如：\`list_components\`、\`read_component\`、\`create_component\`、\`list_tokens\`、\`update_token\`、\`run_audit\`、\`sync_rules\`；规范相关也可用 \`read_schema\` / \`update_schema\`（与手写 JSON 等价）。

## AI 核心契约

详见项目根目录 **AGENTS.md**，三条硬规则：
1. UI 真源在 \`${relLib}\`，禁止在业务 \`src/\` 复制组件实现
2. 仅通过 Design Token 引用颜色/间距，禁止硬编码
3. 组件行为以 schema JSON 为唯一数据源
`;

  writeFileSync(join(rulesDir, "harness.mdc"), rule);
  console.log("  ✅ .cursor/rules/harness.mdc");
}

function generateAgentsMd(projectRoot, libTarget) {
  const relLib = "./" + relative(projectRoot, libTarget).split(sep).join("/");
  const content = `# AGENTS.md — AI 编码边界与契约

## 目录约定（三条硬规则）

1. **UI / 组件 / token 真源** → \`${relLib}/src/components/\` 与 \`${relLib}/src/design-tokens/\`
   - 所有组件实现、变体、样式变更只在此处修改。
   - 业务代码通过 \`@design\` 别名或相对路径引用，禁止复制组件实现到 \`src/\`。

2. **Portal / sync / kit 集成** → \`${relLib}/\` 根层（CLI、scripts、.storybook）
   - 仅用于 Storybook 配置、schema 同步、Portal 适配。
   - 非组件实现代码。

3. **上游 npm 包** → \`node_modules/harness-design/\` **只读**
   - 通过 \`harness upgrade\` 同步变更到 \`${relLib}/\`。
   - 禁止直接修改 \`node_modules\` 内文件。

## AI 编码契约

- **Import 来源**：优先 \`@design\`（指向 \`${relLib}/index.ts\`）；禁止从 \`node_modules\` 深路径引用 kit 组件。
- **颜色**：仅使用 Design Token 语义类（\`bg-primary\`、\`text-muted-foreground\`），禁止硬编码色值。
- **间距**：禁止任意值 Tailwind（\`m-[13px]\`），使用 schema 声明的语义 props。
- **组件规范**：以 \`${relLib}/src/harness/schema/components/*.spec.json\` 为唯一数据源。
- **修改后**：运行 \`npm run sync:harness\` 同步 .cursorrules 与 Tailwind 扩展。
`;
  writeFileSync(join(projectRoot, "AGENTS.md"), content);
  console.log("  ✅ AGENTS.md（项目根）");
}

function generateCursorMcp(projectRoot, libTarget) {
  const relLib = "./" + relative(projectRoot, libTarget).split(sep).join("/");
  const mcpPath = join(projectRoot, ".cursor/mcp.json");

  let existing = {};
  if (existsSync(mcpPath)) {
    try { existing = JSON.parse(readFileSync(mcpPath, "utf8")); } catch {}
  }

  const mcpServers = existing.mcpServers || {};
  mcpServers["harness"] = {
    command: "node",
    args: [join(PKG_ROOT, "bin/harness-mcp.mjs"), relLib],
  };

  mkdirSync(join(projectRoot, ".cursor"), { recursive: true });
  writeFileSync(mcpPath, JSON.stringify({ mcpServers }, null, 2) + "\n");
  console.log("  ✅ .cursor/mcp.json");
}

function mergeHooksJson(existing, incoming) {
  const version = existing.version ?? incoming.version ?? 1;
  const hooks = { ...(existing.hooks || {}) };
  for (const [event, arr] of Object.entries(incoming.hooks || {})) {
    const prev = [...(hooks[event] || [])];
    const seen = new Set(prev.map((h) => JSON.stringify(h)));
    for (const h of arr) {
      const key = JSON.stringify(h);
      if (!seen.has(key)) {
        prev.push(h);
        seen.add(key);
      }
    }
    hooks[event] = prev;
  }
  return { version, hooks };
}

function installCursorHooks(projectRoot) {
  const hooksSrcDir = join(PKG_ROOT, ".cursor/hooks");
  const hooksDstDir = join(projectRoot, ".cursor/hooks");
  const srcJson = join(PKG_ROOT, ".cursor/hooks.json");
  if (!existsSync(hooksSrcDir) || !existsSync(srcJson)) return;

  mkdirSync(hooksDstDir, { recursive: true });
  for (const f of readdirSync(hooksSrcDir)) {
    cpSync(join(hooksSrcDir, f), join(hooksDstDir, f), { recursive: true });
  }

  const incoming = JSON.parse(readFileSync(srcJson, "utf8"));
  const dstJson = join(projectRoot, ".cursor/hooks.json");
  if (existsSync(dstJson)) {
    const existing = JSON.parse(readFileSync(dstJson, "utf8"));
    writeFileSync(dstJson, JSON.stringify(mergeHooksJson(existing, incoming), null, 2) + "\n");
  } else {
    writeFileSync(dstJson, JSON.stringify(incoming, null, 2) + "\n");
  }
  console.log("  ✅ .cursor/hooks（afterFileEdit → harness audit）");
}

function installSelfcheckRule(projectRoot) {
  const src = join(PKG_ROOT, ".cursor/rules/harness-selfcheck.mdc");
  const dstDir = join(projectRoot, ".cursor/rules");
  if (!existsSync(src)) return;
  mkdirSync(dstDir, { recursive: true });
  cpSync(src, join(dstDir, "harness-selfcheck.mdc"));
  console.log("  ✅ .cursor/rules/harness-selfcheck.mdc");
}

/* ─── govern（轻量治理模式） ─── */

function doGovern() {
  const projectRoot = process.cwd();

  console.log(`
╔══════════════════════════════════════════╗
║       Harness Govern — 治理模式          ║
║  仅注入 AI 规则，不拷贝组件/CSS/Storybook ║
╚══════════════════════════════════════════╝
`);
  console.log(`  📂 项目根: ${projectRoot}\n`);

  // 收集 spec 概要（从 npm 包内读取）
  const specDir = join(PKG_ROOT, "src/harness/schema/components");
  let specSummary = "";
  let specDetails = "";
  if (existsSync(specDir)) {
    const files = readdirSync(specDir).filter(f => f.endsWith(".spec.json"));
    for (const f of files) {
      try {
        const s = JSON.parse(readFileSync(join(specDir, f), "utf8"));
        specSummary += `- **${s.componentName}**: ${s.intent}\n`;
        // 收集 forbidden / corrections / examples 用于规则
        if (s.forbidden?.length) {
          specDetails += `\n### ${s.componentName} — 禁止\n`;
          for (const item of s.forbidden) {
            specDetails += `- ❌ ${item.pattern}：${item.reason}\n`;
          }
        }
        if (s.corrections?.length) {
          specDetails += `\n### ${s.componentName} — 纠正\n`;
          for (const item of s.corrections) {
            specDetails += `- ⚠️ ${item.id}：${item.wrong} → ${item.right}（${item.reason}）\n`;
          }
        }
      } catch {}
    }
  }

  // 1. 生成 .cursor/rules/harness.mdc（治理版：不含 .harness 路径引用）
  const rulesDir = join(projectRoot, ".cursor/rules");
  mkdirSync(rulesDir, { recursive: true });

  const governRule = `---
description: Harness AI 编码治理规则 — 适用于已有项目的组件使用约束
alwaysApply: true
---

# Harness AI 编码治理

本项目使用 Harness 治理模式（\`harness govern\`），AI 编码必须遵守以下规范。

## 组件引用规则

1. **禁止使用原生 HTML 标签替代已有组件**：如果项目中已有 Button、Input、Table 等封装组件，禁止绕过使用原生标签
2. **禁止手写间距**：不允许 \`m-[13px]\`、\`p-[7px]\` 等任意值 Tailwind 类；使用预设的 spacing scale
3. **颜色仅用语义类**：\`bg-primary\`、\`text-muted-foreground\` 等，禁止硬编码色值（如 \`#ff6600\`、\`rgb()\`）
4. **一致的设计语言**：新增 UI 必须与现有组件的视觉风格保持一致

## 参考组件规范

以下组件规范来自 Harness 组件库，AI 应参考这些模式：

${specSummary || "（无可用规范）"}

## 详细约束

${specDetails || "（无详细约束）"}

## AI 核心契约

1. 优先复用项目中已有的 UI 组件，禁止重复造轮子
2. 仅通过 Design Token / CSS 变量 / Tailwind 语义类引用颜色和间距
3. 修改 UI 前先查阅项目中已有的组件和模式
4. 不引入与项目现有设计系统风格不一致的第三方 UI 库
`;

  writeFileSync(join(rulesDir, "harness.mdc"), governRule);
  console.log("  ✅ .cursor/rules/harness.mdc（AI 治理规则）");

  // 2. 安装 selfcheck 规则
  const selfcheckSrc = join(PKG_ROOT, ".cursor/rules/harness-selfcheck.mdc");
  if (existsSync(selfcheckSrc)) {
    cpSync(selfcheckSrc, join(rulesDir, "harness-selfcheck.mdc"));
    console.log("  ✅ .cursor/rules/harness-selfcheck.mdc（自检清单）");
  }

  // 3. 生成 AGENTS.md（治理版）
  const agentsContent = `# AGENTS.md — AI 编码边界与契约（Govern 模式）

## 治理模式说明

本项目使用 Harness **治理模式**（govern）——仅注入 AI 编码规则，不包含独立组件库目录。
项目保持原有结构不变，AI 编码通过规则文件引导一致性。

## AI 编码契约

### 必须

- **复用现有组件**：在创建新 UI 前，搜索项目中是否已有类似组件
- **语义化样式**：使用 Tailwind 主题类或 CSS 变量，不硬编码颜色/尺寸
- **渐进增强**：新增功能应基于项目现有设计模式扩展，而非另起炉灶
- **保持一致性**：按钮、输入框、卡片等 UI 元素应与项目现有风格统一

### 禁止

- ❌ 使用原生 HTML 标签替代项目已有的封装组件
- ❌ 使用任意值 Tailwind 类（\`m-[13px]\`、\`w-[347px]\`）
- ❌ 硬编码色值（\`#fff\`、\`rgb()\`、\`hsl()\`）
- ❌ 引入与现有设计系统冲突的第三方 UI 框架
- ❌ 在业务代码中复制粘贴组件实现（应抽取为共享组件）

### 修改 UI 的流程

1. 先查阅项目中已有组件（搜索 components 目录）
2. 确认是否可以复用 / 扩展现有组件
3. 若需新建组件，遵循项目现有的命名和文件组织约定
4. 使用语义化的 Tailwind 类和 CSS 变量
`;
  writeFileSync(join(projectRoot, "AGENTS.md"), agentsContent);
  console.log("  ✅ AGENTS.md（AI 编码边界）");

  // 4. 生成 .cursorrules（简洁版，兼容非 Cursor IDE）
  const cursorrules = `# Harness AI Govern Rules

You are working in a project governed by Harness design rules.

## Key Constraints
- Reuse existing UI components; do not recreate what already exists
- Use semantic Tailwind classes only (no arbitrary values like m-[13px])
- Use CSS variables or theme tokens for colors (no hardcoded hex/rgb)
- Maintain visual consistency with the project's existing design language
- Search for existing components before creating new UI elements

## Forbidden Patterns
- Raw HTML tags when a project component exists (e.g. <button> when Button component exists)
- Arbitrary Tailwind values: m-[*], p-[*], w-[*], h-[*], text-[#*]
- Hardcoded colors: bg-[#...], text-[#...], border-[#...]
- Inline styles for layout/spacing/color

## Before Modifying UI
1. Search the project for existing components
2. Check if the change can be achieved by extending an existing component
3. Follow established naming conventions and file structure
`;
  writeFileSync(join(projectRoot, ".cursorrules"), cursorrules);
  console.log("  ✅ .cursorrules（IDE 通用规则）");

  // 5. 可选：配置 MCP（如果 harness-mcp.mjs 存在）
  const mcpEntry = join(PKG_ROOT, "bin", "harness-mcp.mjs");
  if (existsSync(mcpEntry)) {
    const mcpPath = join(projectRoot, ".cursor/mcp.json");
    let existing = {};
    if (existsSync(mcpPath)) {
      try { existing = JSON.parse(readFileSync(mcpPath, "utf8")); } catch {}
    }
    const mcpServers = existing.mcpServers || {};
    mcpServers["harness"] = {
      command: "node",
      args: [mcpEntry, projectRoot],
    };
    mkdirSync(join(projectRoot, ".cursor"), { recursive: true });
    writeFileSync(mcpPath, JSON.stringify({ mcpServers }, null, 2) + "\n");
    console.log("  ✅ .cursor/mcp.json（MCP Server）");
  }

  console.log(`
✅ 治理模式初始化完成！

生成的文件：
  • .cursor/rules/harness.mdc       — AI 编码治理规则（alwaysApply）
  • .cursor/rules/harness-selfcheck.mdc — 改完代码后的自检清单
  • .cursorrules                     — IDE 通用规则（兼容 Cursor/Copilot/Claude）
  • AGENTS.md                        — AI 编码边界说明

与 init 模式的区别：
  • 不拷贝组件源码、CSS、Storybook
  • 不创建 .harness/ 目录
  • 不修改 package.json 或安装依赖
  • 仅通过规则文件约束 AI 行为

重新打开 IDE 后规则生效。
`);
}

/* ─── upgrade ─── */

function doUpgrade(targetArg) {
  const target = resolve(process.cwd(), targetArg || DEFAULT_HARNESS_DIR);

  if (!existsSync(join(target, "package.json"))) {
    console.error(`❌ 目标目录不存在，请先运行: harness init`);
    process.exit(1);
  }

  const parentPkg = readPkgJson(PKG_ROOT);
  const kitVersion = parentPkg.version || "0.0.0";
  const oldManifest = readManifest(target);

  console.log(`\n⬆️  升级 kit → ${target}`);
  console.log(`   新版本: ${kitVersion}${oldManifest ? ` (旧版本: ${oldManifest.kitVersion})` : " (无旧 manifest)"}\n`);

  const kitFiles = collectKitFiles(PKG_ROOT);
  const oldFiles = oldManifest?.files ?? {};
  const stats = { added: 0, updated: 0, skipped: 0, unchanged: 0 };
  const newFiles = {};

  for (const rel of kitFiles) {
    const kitSrc = join(PKG_ROOT, rel);
    const localDst = join(target, rel);
    const kitHash = fileHash(kitSrc);
    const oldEntry = oldFiles[rel];

    if (!existsSync(localDst)) {
      mkdirSync(join(target, rel, ".."), { recursive: true });
      cpSync(kitSrc, localDst);
      newFiles[rel] = { kitHash, status: "new" };
      stats.added++;
      console.log(`  ➕ 新增: ${rel}`);
      continue;
    }

    const localHash = fileHash(localDst);

    if (oldEntry && localHash === oldEntry.kitHash) {
      cpSync(kitSrc, localDst);
      newFiles[rel] = { kitHash, status: "unchanged" };
      if (kitHash !== oldEntry.kitHash) {
        stats.updated++;
        console.log(`  🔄 已更新: ${rel}`);
      } else {
        stats.unchanged++;
      }
      continue;
    }

    newFiles[rel] = { kitHash: oldEntry?.kitHash ?? localHash, status: "modified" };
    stats.skipped++;
    console.log(`  ⏭️  跳过（已修改）: ${rel}`);
  }

  const manifest = {
    kitPackage: "harness-design",
    kitVersion,
    syncedAt: new Date().toISOString(),
    referencePolicy: REFERENCE_POLICY,
    files: newFiles,
  };
  writeManifest(target, manifest);
  writeKitStatus(target, manifest);

  // 重新生成 index.ts 以包含新增组件
  generateIndex(target);

  console.log(`\n✅ 升级完成`);
  console.log(`   新增: ${stats.added}  更新: ${stats.updated}  跳过: ${stats.skipped}  不变: ${stats.unchanged}\n`);
  if (stats.skipped > 0) {
    console.log("   ⚠️  跳过的文件为用户已修改内容，不会被覆盖。\n      如需强制更新，请手动从 kit 拷贝或删除本地文件后重新 upgrade。\n");
  }
}

/* ─── start（设计师一键启动） ─── */

function doStart(targetArg) {
  const target = resolve(process.cwd(), targetArg || DEFAULT_HARNESS_DIR);

  doInit(targetArg);

  if (!existsSync(join(target, "node_modules"))) {
    console.log("\n  📥 安装依赖（首次启动，约 1-2 分钟）…\n");
    try {
      execSync("npm install --loglevel=error", { cwd: target, stdio: "inherit" });
    } catch {
      console.error("❌ 依赖安装失败");
      process.exit(1);
    }
  }

  doDev(targetArg);
}

/* ─── dev ─── */

/** 损坏的 Storybook manager 缓存会导致 manager-bundle.js 等 404、页面一片空白 */
function clearStorybookManagerCache(target) {
  const dirs = [
    join("node_modules", ".cache", "storybook"),
    join("node_modules", ".vite"),
    join("node_modules", ".vite-storybook-harness"),
  ];
  for (const rel of dirs) {
    const p = join(target, rel);
    if (!existsSync(p)) continue;
    try {
      rmSync(p, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

function waitForPort(port, host, timeoutMs) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    function tryConnect() {
      if (Date.now() > deadline) {
        reject(new Error(`端口 ${port} 超时未就绪`));
        return;
      }
      const sock = createConnection({ port, host }, () => {
        sock.destroy();
        resolve();
      });
      sock.on("error", () => {
        setTimeout(tryConnect, 500);
      });
    }

    tryConnect();
  });
}

function openUrl(url) {
  const platform = process.platform;
  const cmd = platform === "darwin" ? "open" : platform === "win32" ? "start" : "xdg-open";
  spawn(cmd, [url], { shell: true, stdio: "ignore", detached: true }).unref();
}

function doDev(targetArg) {
  const target = resolve(process.cwd(), targetArg || DEFAULT_HARNESS_DIR);

  if (!existsSync(join(target, ".storybook"))) {
    console.error(`❌ 未找到配置，请先运行: harness init ${targetArg || DEFAULT_HARNESS_DIR}`);
    process.exit(1);
  }

  const port = DEFAULT_PORT;
  const portalUrl = `http://localhost:${port}${PORTAL_PATH}`;

  console.log(`
╔══════════════════════════════════════════╗
║         HarnessUI Design Portal          ║
║     AI 组件治理平台 · 设计师工作台        ║
╚══════════════════════════════════════════╝
`);
  console.log(`  📂 组件库: ${target}`);
  console.log(`  🌐 地址:   http://localhost:${port}`);
  console.log(`  🎨 Portal: ${portalUrl}`);
  console.log(`\n  启动中…（首次会编译 Storybook 管理端，约 10–30 秒）\n`);

  clearStorybookManagerCache(target);

  const storybookCli = join(target, "node_modules", ".bin", "storybook");
  if (!existsSync(storybookCli)) {
    console.error(`❌ 未找到 Storybook，请在目录下执行: cd "${target}" && npm install`);
    process.exit(1);
  }

  const child = spawn(
    process.execPath,
    [storybookCli, "dev", "-p", String(port), "--no-open", "--disable-telemetry", "--quiet"],
    {
      cwd: target,
      stdio: "inherit",
      env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: "1" },
    },
  );

  waitForPort(port, "127.0.0.1", 90_000)
    .then(() => {
      console.log(`  ✅ 就绪！正在打开浏览器…\n`);
      openUrl(portalUrl);
    })
    .catch((err) => {
      console.warn(`  ⚠️  ${err.message}`);
      console.warn(`  请手动打开: ${portalUrl}\n`);
    });

  child.on("exit", (code) => process.exit(code ?? 0));
}

/* ─── mcp ─── */

function doMcp(targetArg) {
  const target = resolve(process.cwd(), targetArg || DEFAULT_HARNESS_DIR);

  if (!existsSync(join(target, "src/design-tokens/tokens.json"))) {
    console.error(`❌ 未找到 tokens.json，请先运行: harness init ${targetArg || DEFAULT_HARNESS_DIR}`);
    process.exit(1);
  }

  console.log(`\n🔌 启动 MCP Server → ${target}\n`);

  const mcpEntry = join(PKG_ROOT, "bin", "harness-mcp.mjs");
  if (!existsSync(mcpEntry)) {
    console.error("❌ MCP Server 尚未实现，即将支持");
    process.exit(1);
  }

  const child = spawn("node", [mcpEntry, target], {
    stdio: "inherit",
  });

  child.on("exit", (code) => process.exit(code ?? 0));
}

/* ─── sync ─── */

function doSync(targetArg) {
  const target = resolve(process.cwd(), targetArg || DEFAULT_HARNESS_DIR);

  if (!existsSync(join(target, "src/harness/schema/components"))) {
    console.error(`❌ 未找到 schema 目录，请先运行: harness init ${targetArg || DEFAULT_HARNESS_DIR}`);
    process.exit(1);
  }

  console.log(`\n🔄 同步 schema → rules + tailwind → ${target}\n`);

  const syncScript = join(PKG_ROOT, "scripts/sync-from-schema.mjs");
  const localSync = join(target, "scripts/sync-from-schema.mjs");
  const script = existsSync(localSync) ? localSync : syncScript;

  try {
    execSync(`node "${script}"`, { cwd: target, stdio: "inherit" });

    execSync(`node "${join(existsSync(join(target, "scripts/emit-design-tokens-css.mjs")) ? target : PKG_ROOT, "scripts/emit-design-tokens-css.mjs")}"`, {
      cwd: target,
      stdio: "inherit",
    });

    console.log("\n✅ 同步完成：.cursorrules + Tailwind 扩展 + 规则镜像 + CSS 变量 已更新\n");
  } catch (e) {
    console.error(`\n❌ 同步失败: ${e.message}\n`);
    process.exit(1);
  }
}

/* ─── audit ─── */

function doAudit(targetArg) {
  const target = resolve(process.cwd(), targetArg || DEFAULT_HARNESS_DIR);

  if (!existsSync(join(target, "src/harness"))) {
    console.error(`❌ 未找到 harness 目录，请先运行: harness init ${targetArg || DEFAULT_HARNESS_DIR}`);
    process.exit(1);
  }

  console.log(`\n🔍 合规审计 → ${target}\n`);

  const auditScript = join(PKG_ROOT, "scripts/harness-audit.mjs");
  const localAudit = join(target, "scripts/harness-audit.mjs");
  const script = existsSync(localAudit) ? localAudit : auditScript;

  try {
    execSync(`node "${script}"`, { cwd: target, stdio: "inherit" });
  } catch (e) {
    process.exit(e.status ?? 1);
  }
}
