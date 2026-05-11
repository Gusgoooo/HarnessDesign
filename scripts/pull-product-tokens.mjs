#!/usr/bin/env node
/**
 * 将「线上 / 产品」下发的 tokens.json 拉取到本仓库唯一消费路径，并执行 sync:tokens。
 *
 * 用法（在仓库根或含 src/design-tokens 的 kit 根执行）：
 *   HARNESS_TOKENS_URL=https://your-cdn.example.com/design/tokens.json npm run sync:tokens:pull
 *   node scripts/pull-product-tokens.mjs --url=https://...
 *
 * 可选鉴权（勿把密钥写进仓库，用 CI Secret）：
 *   HARNESS_TOKENS_AUTH_HEADER='Bearer xxx'
 *
 * 可选指定根目录（消费者 .harness 子工程）：
 *   node scripts/pull-product-tokens.mjs --url=... --root=/path/to/.harness
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function argValue(name) {
  const pre = `${name}=`;
  const hit = process.argv.find((a) => a === name || a.startsWith(pre));
  if (!hit) return undefined;
  if (hit === name) {
    const i = process.argv.indexOf(hit);
    return process.argv[i + 1];
  }
  return hit.slice(pre.length);
}

const url = argValue("--url") ?? process.env.HARNESS_TOKENS_URL;
const repoRoot = path.resolve(argValue("--root") ?? process.cwd());
const tokensPath = path.join(repoRoot, "src/design-tokens/tokens.json");
const auth = process.env.HARNESS_TOKENS_AUTH_HEADER;

if (!url || !String(url).trim()) {
  console.error(
    "缺少令牌 URL：请设置环境变量 HARNESS_TOKENS_URL 或传入 --url=https://...\n" +
      "示例：HARNESS_TOKENS_URL=https://api.example.com/v1/tokens.json npm run sync:tokens:pull",
  );
  process.exit(1);
}

function validateTokensDoc(doc) {
  if (!doc || typeof doc !== "object") throw new Error("响应不是 JSON 对象");
  if (doc.version === 2) {
    if (!doc.seed || typeof doc.seed !== "object") throw new Error("v2 缺少 seed 对象");
    return;
  }
  if (doc.version === 1 || Array.isArray(doc.tokens)) return;
  throw new Error("无法识别：需 version:2 + seed，或 v1 的 tokens 数组");
}

async function main() {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 60_000);

  const headers = { Accept: "application/json" };
  if (auth) headers.Authorization = auth;

  let res;
  try {
    res = await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  let doc;
  try {
    doc = JSON.parse(text);
  } catch {
    throw new Error("响应体不是合法 JSON");
  }
  validateTokensDoc(doc);

  const dir = path.dirname(tokensPath);
  if (!fs.existsSync(dir)) {
    throw new Error(`目标目录不存在：${dir}（请确认 --root 指向含 src/design-tokens 的 kit 根）`);
  }

  const pretty = `${JSON.stringify(doc, null, 2)}\n`;
  fs.writeFileSync(tokensPath, pretty, "utf8");
  console.log(`已写入 ${path.relative(repoRoot, tokensPath) || tokensPath}`);

  execSync("npm run sync:tokens", { cwd: repoRoot, stdio: "inherit" });
  console.log("sync:tokens 已完成。");
}

main().catch((e) => {
  console.error(`pull-product-tokens 失败：${e.message || e}`);
  process.exit(1);
});
