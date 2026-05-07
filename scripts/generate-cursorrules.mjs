#!/usr/bin/env node
/**
 * 仅生成根目录 .cursorrules（不触达 Tailwind）。
 * 完整闭环请用：npm run sync:harness
 */
import fs from "node:fs";
import path from "node:path";
import { loadSpecs, getRepoRoot } from "./lib/load-specs.mjs";
import { renderCursorrules } from "./lib/render-harness-rules.mjs";

const root = getRepoRoot();
const outFile = path.join(root, ".cursorrules");

const specs = loadSpecs();
fs.writeFileSync(outFile, renderCursorrules(specs), "utf8");
console.log(`Wrote ${path.relative(root, outFile)} (${specs.length} specs)`);
