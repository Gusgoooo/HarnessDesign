#!/usr/bin/env node
/**
 * 为缺少 spec.json 的 starter 组件批量生成初始规范。
 * 运行：node scripts/generate-missing-specs.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const STARTER_DIR = "src/components/starter";
const SPEC_DIR = "src/harness/schema/components";

const SKIP_FILES = ["ComponentGallery.tsx", "kitchen-sink-data-table.tsx", "composite-data-table.tsx"];

// Category assignment based on component nature
const CATEGORY_MAP = {
  "accordion": "disclosure",
  "alert-dialog": "overlay",
  "aspect-ratio": "layout",
  "breadcrumb": "navigation",
  "button-group": "layout",
  "calendar": "input",
  "carousel": "layout",
  "collapsible": "disclosure",
  "command": "input",
  "context-menu": "overlay",
  "drawer": "overlay",
  "empty": "feedback",
  "field": "form",
  "hover-card": "overlay",
  "input-group": "input",
  "input-otp": "input",
  "item": "layout",
  "kbd": "typography",
  "menubar": "navigation",
  "navigation-menu": "navigation",
  "pagination": "navigation",
  "resizable": "layout",
  "sheet": "overlay",
  "sidebar": "navigation",
  "sonner": "feedback",
  "spinner": "feedback",
  "table": "data-display",
  "toggle": "input",
  "toggle-group": "input",
};

// Intent descriptions
const INTENT_MAP = {
  "accordion": "可折叠内容面板组，适用于 FAQ、设置分组等需要逐项展开的场景。",
  "alert-dialog": "阻断式确认弹窗：用于不可逆操作（删除、提交）前二次确认，必须明确响应后才能继续。",
  "aspect-ratio": "固定宽高比容器，用于图片、视频、地图等需要保持比例的媒体内容。",
  "breadcrumb": "层级导航面包屑，展示当前页面在站点结构中的位置，支持逐级返回。",
  "button-group": "按钮编组容器，将相关操作按钮视觉上组合为一组（如工具栏、分段控件）。",
  "calendar": "日期选择日历面板，用于日期范围选择器的核心渲染层。",
  "carousel": "轮播/走马灯容器，用于产品图片、banner、卡片列表等水平滚动展示。",
  "collapsible": "单个可折叠区域，比 Accordion 更轻量——用于单独的「展开/收起更多」场景。",
  "command": "命令面板（类 VS Code Ctrl+K / Spotlight），用于全局搜索、快捷操作入口。",
  "context-menu": "右键上下文菜单，用于对选中内容提供上下文相关的操作选项。",
  "drawer": "底部/侧边抽屉面板，适用于移动端操作面板或辅助内容展示。",
  "empty": "空状态占位组件，当列表/页面无数据时展示说明文案和引导操作。",
  "field": "表单字段容器，统一 label + input + description + error 的布局与无障碍绑定。",
  "hover-card": "悬浮卡片，鼠标悬停时展示额外预览信息（如用户资料、链接预览）。",
  "input-group": "输入框组合容器，将前缀/后缀（图标、文字、按钮）与 input 视觉合为一体。",
  "input-otp": "一次性密码输入（OTP/验证码），固定位数的分格输入框。",
  "item": "列表项布局组件，提供图标/媒体 + 文本 + 操作按钮的标准行结构。",
  "kbd": "键盘快捷键标签，展示按键组合（如 Ctrl+S）的视觉样式。",
  "menubar": "菜单栏（类桌面应用顶部菜单），多个下拉菜单并排展示。",
  "navigation-menu": "顶部导航菜单，支持简单链接列表或带下拉面板的复杂导航结构。",
  "pagination": "分页导航，提供页码跳转和前后翻页控件。",
  "resizable": "可拖拽调整大小的面板组，用于 IDE 式多面板布局。",
  "sheet": "侧边滑出面板（类移动端抽屉但支持上下左右四方向），用于设置面板、详情查看。",
  "sidebar": "应用侧边栏骨架，包含 header/content/footer/menu 的完整导航布局。",
  "sonner": "Toast 通知（基于 sonner 库），用于轻量级操作反馈（成功/失败/提示）。",
  "spinner": "加载旋转指示器，用于按钮内/区域/全屏加载状态。",
  "table": "数据表格基础层，提供 table/thead/tbody/tr/th/td 的语义化 HTML 封装与一致样式。",
  "toggle": "切换按钮（按下/弹起状态），用于启用/禁用某功能或视图模式切换。",
  "toggle-group": "切换按钮组，一组互斥或多选的 toggle 按钮（如视图模式：列表/网格/看板）。",
};

// Blacklist templates by category
const BLACKLIST_TEMPLATES = {
  overlay: [
    { description: "禁止覆盖层级定位", pattern: "^(z-|fixed|absolute|inset)" },
    { description: "禁止覆盖动画（由组件内部控制）", pattern: "^(animate-|transition-|duration-)" },
  ],
  input: [
    { description: "禁止覆盖焦点环样式", pattern: "^(ring-|outline-)" },
    { description: "禁止覆盖高度（由 size 控制）", pattern: "^h-" },
  ],
  navigation: [
    { description: "禁止覆盖布局结构", pattern: "^(flex|grid|gap-|items-|justify-)" },
  ],
  layout: [
    { description: "禁止覆盖溢出与定位", pattern: "^(overflow|position|relative|absolute)" },
  ],
  feedback: [
    { description: "禁止覆盖动画", pattern: "^(animate-|transition-)" },
  ],
  disclosure: [
    { description: "禁止覆盖过渡动画", pattern: "^(transition-|duration-|data-)" },
  ],
  typography: [
    { description: "禁止覆盖字体", pattern: "^(font-family|font-mono|font-sans)" },
  ],
  "data-display": [
    { description: "禁止覆盖表格结构", pattern: "^(border-collapse|table-)" },
  ],
  form: [
    { description: "禁止覆盖布局结构", pattern: "^(flex|grid|gap-)" },
  ],
};

function extractExports(source) {
  const exports = [];
  // Match: export { Foo, Bar }
  const reExportBrace = /export\s*\{([^}]+)\}/g;
  let m;
  while ((m = reExportBrace.exec(source))) {
    for (const part of m[1].split(",")) {
      const sym = part.trim().split(/\s+as\s+/).pop().trim();
      if (sym && /^[A-Z]/.test(sym)) exports.push(sym);
    }
  }
  // Match: export const Foo = ... / export function Foo / export const Foo:
  const reExportDecl = /export\s+(?:const|function|class)\s+([A-Z]\w+)/g;
  while ((m = reExportDecl.exec(source))) {
    if (!exports.includes(m[1])) exports.push(m[1]);
  }
  // Match: displayName assignments for forwardRef pattern
  const reDisplayName = /(\w+)\.displayName\s*=\s*["'](\w+)["']/g;
  while ((m = reDisplayName.exec(source))) {
    if (!exports.includes(m[1]) && /^[A-Z]/.test(m[1])) exports.push(m[1]);
  }
  return exports;
}

function extractBaselineTokens(source) {
  // Extract first cn() call's static classes as baseline
  const reCn = /className=\{cn\(\s*["'`]([^"'`]+)["'`]/g;
  const tokens = new Set();
  let m;
  while ((m = reCn.exec(source))) {
    for (const cls of m[1].split(/\s+/)) {
      // Skip variant-prefixed, arbitrary values, and very specific ones
      if (!cls || cls.includes("[") || cls.includes(":") || cls.includes("/")) continue;
      tokens.add(cls);
    }
    break; // only first cn() for root element
  }
  return [...tokens].slice(0, 12); // cap at 12 tokens
}

function extractVariantProps(source) {
  // Look for cva variants
  const props = [];
  const cvaMatch = source.match(/cva\([^)]*\{[\s\S]*?variants:\s*\{([\s\S]*?)\}\s*,?\s*defaultVariants/);
  if (cvaMatch) {
    const variantsBlock = cvaMatch[1];
    const variantNames = [...variantsBlock.matchAll(/(\w+):\s*\{/g)].map(m => m[1]);
    for (const name of variantNames) {
      const variantRe = new RegExp(`${name}:\\s*\\{([\\s\\S]*?)\\}`, "m");
      const block = variantsBlock.match(variantRe);
      if (!block) continue;
      const options = [...block[1].matchAll(/(\w+):\s*["'`]([^"'`]*)["'`]/g)];
      if (options.length > 0) {
        const enumMap = {};
        const typeValues = [];
        for (const [, key, classes] of options) {
          enumMap[key] = classes.split(/\s+/).filter(Boolean);
          typeValues.push(`"${key}"`);
        }
        props.push({
          name,
          description: `${name} 变体`,
          type: typeValues.join(" | "),
          required: false,
          defaultValue: options[0]?.[1] || "default",
          enumMap,
        });
      }
    }
  }
  return props;
}

function kebabToPascal(str) {
  return str.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
}

function generateSpec(componentId, source) {
  const category = CATEGORY_MAP[componentId] || "ui";
  const intent = INTENT_MAP[componentId] || "";
  const primitives = extractExports(source);
  const baselineTokens = extractBaselineTokens(source);
  const variantProps = extractVariantProps(source);
  const blacklist = BLACKLIST_TEMPLATES[category] || [];
  const componentName = kebabToPascal(componentId);

  const spec = {
    id: componentId,
    componentName,
    version: "1.0.0",
    intent,
    wraps: {
      module: `@/components/starter/${componentId}`,
      primitives: primitives.length > 0 ? primitives : [componentName],
    },
    requiredProps: [
      {
        name: "children",
        description: "子内容",
        type: "React.ReactNode",
        required: true,
      },
    ],
    optionalProps: variantProps.length > 0 ? variantProps : undefined,
    styleLock: {
      baselineTokens,
      blacklist,
    },
    aiPrompt: `使用 ${componentName} 时从 @/components/starter/${componentId} 导入；${intent ? intent.split("。")[0] + "。" : ""}`,
    meta: {
      tags: [componentId, category],
      category,
      status: "stable",
    },
  };

  // Remove undefined fields
  if (!spec.optionalProps) delete spec.optionalProps;

  return spec;
}

// Main
const existingSpecs = new Set(
  readdirSync(SPEC_DIR)
    .filter(f => f.endsWith(".spec.json"))
    .map(f => f.replace(".spec.json", ""))
);

const componentFiles = readdirSync(STARTER_DIR)
  .filter(f => f.endsWith(".tsx") && !f.includes(".stories.") && !SKIP_FILES.includes(f));

let generated = 0;
for (const file of componentFiles) {
  const id = basename(file, ".tsx").toLowerCase() === basename(file, ".tsx")
    ? basename(file, ".tsx")
    : basename(file, ".tsx").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

  // Skip if spec already exists
  if (existingSpecs.has(id)) continue;
  // Skip DataTable (already has data-table spec)
  if (id === "datatable" || id === "data-table") continue;

  const source = readFileSync(join(STARTER_DIR, file), "utf8");
  const spec = generateSpec(id, source);
  const outPath = join(SPEC_DIR, `${id}.spec.json`);
  writeFileSync(outPath, JSON.stringify(spec, null, 2) + "\n");
  console.log(`Generated: ${id}.spec.json (${spec.wraps.primitives.length} primitives)`);
  generated++;
}

console.log(`\nDone: ${generated} specs generated.`);
