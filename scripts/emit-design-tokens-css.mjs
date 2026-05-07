#!/usr/bin/env node
/**
 * 读取 src/design-tokens/tokens.json，生成 src/styles/design-tokens.generated.css（:root / .dark）。
 * 跳过 emitCss === false 的条目（仅用于 Story Controls / 文档绑定，不生成 CSS 变量）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "src/design-tokens/tokens.json");
const out = path.join(root, "src/styles/design-tokens.generated.css");

const doc = JSON.parse(fs.readFileSync(src, "utf8"));
const tokens = Array.isArray(doc.tokens) ? doc.tokens : [];

const rootLines = [":root {"];
const darkLines = [".dark {"];

for (const t of tokens) {
  if (t?.emitCss === false) continue;
  if (!t?.id || t.light === undefined || t.dark === undefined) continue;
  rootLines.push(`  --${t.id}: ${t.light};`);
  darkLines.push(`  --${t.id}: ${t.dark};`);
}

rootLines.push("}");
darkLines.push("}");

const banner = `/* AUTO-GENERATED — 源：src/design-tokens/tokens.json；请勿手改。运行 npm run sync:tokens */\n\n`;

fs.writeFileSync(out, `${banner}${rootLines.join("\n")}\n\n${darkLines.join("\n")}\n`, "utf8");
console.log(`Wrote ${path.relative(root, out)} (${tokens.length} rows, ${tokens.filter((t) => t.emitCss !== false).length} emitted)`);
