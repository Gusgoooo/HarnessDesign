/**
 * 将源码中的 Tailwind 数字间距/字号 scale、百分比 opacity、ms duration
 * 替换为设计 token 语义名（就近偏大，与本仓库 tw-class-audit 一致）。
 * 用法：node scripts/replace-numeric-tailwind-with-semantic.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const STARTER = path.join(ROOT, "src/components/starter");

const TOKEN_SPACING = {
  0: "0px",
  xxxs: "2px",
  xxs: "4px",
  xs: "8px",
  sm: "12px",
  base: "16px",
  md: "20px",
  lg: "24px",
  xl: "32px",
};

const TW_NUM_SPACING_PX = {
  0: "0px",
  px: "1px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  11: "44px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
};

const PREFIXES = [
  "p",
  "px",
  "py",
  "pt",
  "pb",
  "pl",
  "pr",
  "m",
  "mx",
  "my",
  "mt",
  "mb",
  "ml",
  "mr",
  "gap",
  "gap-x",
  "gap-y",
  "space-x",
  "space-y",
  "inset-x",
  "inset-y",
  "inset",
  "top",
  "right",
  "bottom",
  "left",
  "size",
  "min-w",
  "max-w",
  "min-h",
  "max-h",
  "w",
  "h",
];

function parsePx(css) {
  const m = /^([\d.]+)px$/i.exec(String(css).trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function nearestPreferLarger(targetPx, tokens) {
  let bestK = null;
  let bestD = Infinity;
  let bestPx = -Infinity;
  for (const [k, css] of Object.entries(tokens)) {
    const px = parsePx(css);
    if (px == null) continue;
    const d = Math.abs(targetPx - px);
    if (d < bestD || (d === bestD && px > bestPx)) {
      bestK = k;
      bestD = d;
      bestPx = px;
    }
  }
  return bestK;
}

function findExactCssKey(css, tokens) {
  for (const [k, v] of Object.entries(tokens)) {
    if (v === css) return k;
  }
  return null;
}

function semanticForScaleKey(key) {
  const tw = TW_NUM_SPACING_PX[key];
  if (!tw) return null;
  const exact = findExactCssKey(tw, TOKEN_SPACING);
  const px = parsePx(tw);
  return exact ?? (px != null ? nearestPreferLarger(px, TOKEN_SPACING) : null);
}

function reEsc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 带连字符前缀的 Tailwind class 边界；禁止匹配分数分子（如 w-3/4、top-1/2）。 */
function replaceClass(content, literalClass, replacement) {
  const re = new RegExp(`(?<![\\w-])${reEsc(literalClass)}(?!/)`, "g");
  return content.replace(re, replacement);
}

const TOKEN_OPACITY = {
  transparent: "0",
  subtle: "0.4",
  disabled: "0.5",
  muted: "0.7",
  opaque: "1",
};

const TW_NUM_OPACITY = {
  0: "0",
  5: "0.05",
  10: "0.1",
  15: "0.15",
  20: "0.2",
  25: "0.25",
  30: "0.3",
  35: "0.35",
  40: "0.4",
  45: "0.45",
  50: "0.5",
  55: "0.55",
  60: "0.6",
  65: "0.65",
  70: "0.7",
  75: "0.75",
  80: "0.8",
  85: "0.85",
  90: "0.9",
  95: "0.95",
  100: "1",
};

function nearestOpacity(n) {
  let bestK = null;
  let bestD = Infinity;
  let bestV = -Infinity;
  for (const [k, v] of Object.entries(TOKEN_OPACITY)) {
    const t = Number(v);
    const d = Math.abs(n - t);
    if (d < bestD || (d === bestD && t > bestV)) {
      bestK = k;
      bestD = d;
      bestV = t;
    }
  }
  return bestK;
}

function semanticForOpacityTailwindKey(key) {
  const s = TW_NUM_OPACITY[key];
  if (!s) return null;
  const exact = findExactCssKey(s, TOKEN_OPACITY);
  const n = Number(s);
  return exact ?? (Number.isFinite(n) ? nearestOpacity(n) : null);
}

const TOKEN_DURATION = {
  fast: "0.1s",
  150: "0.15s",
  mid: "0.2s",
  slow: "0.3s",
  long: "0.5s",
  whole: "1s",
};

const TW_NUM_DURATION_MS = {
  0: "0s",
  75: "0.075s",
  100: "0.1s",
  150: "0.15s",
  200: "0.2s",
  300: "0.3s",
  500: "0.5s",
  700: "0.7s",
  1000: "1s",
};

function parseSec(s) {
  const m = /^([\d.]+)s$/i.exec(String(s).trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function nearestDuration(sec) {
  let bestK = null;
  let bestD = Infinity;
  let bestS = -Infinity;
  for (const [k, v] of Object.entries(TOKEN_DURATION)) {
    const t = parseSec(v);
    if (t == null) continue;
    const d = Math.abs(sec - t);
    if (d < bestD || (d === bestD && t > bestS)) {
      bestK = k;
      bestD = d;
      bestS = t;
    }
  }
  return bestK;
}

function semanticForDurationTailwindKey(key) {
  if (key in TOKEN_DURATION) return key;
  const css = TW_NUM_DURATION_MS[key];
  if (!css) return null;
  const exact = findExactCssKey(css, TOKEN_DURATION);
  const sec = parseSec(css);
  return exact ?? (sec != null ? nearestDuration(sec) : null);
}

function patchFile(relPath) {
  const full = path.join(STARTER, relPath);
  let s = fs.readFileSync(full, "utf8");
  let out = s;

  const scaleKeys = Object.keys(TW_NUM_SPACING_PX).sort(
    (a, b) => b.length - a.length,
  );
  for (const prefix of PREFIXES) {
    for (const key of scaleKeys) {
      const sem = semanticForScaleKey(key);
      if (!sem) continue;
      const from = `${prefix}-${key}`;
      const to = sem === "0" ? `${prefix}-0` : `${prefix}-${sem}`;
      if (from === to) continue;
      out = replaceClass(out, from, to);
    }
  }
  for (const prefix of PREFIXES) {
    for (const key of scaleKeys) {
      const sem = semanticForScaleKey(key);
      if (!sem) continue;
      const fromNeg = `-${prefix}-${key}`;
      const toNeg = sem === "0" ? `-${prefix}-0` : `-${prefix}-${sem}`;
      if (fromNeg === toNeg) continue;
      out = replaceClass(out, fromNeg, toNeg);
    }
  }

  const opKeys = Object.keys(TW_NUM_OPACITY).sort((a, b) => b.length - a.length);
  for (const key of opKeys) {
    const sem = semanticForOpacityTailwindKey(key);
    if (!sem) continue;
    const from = `opacity-${key}`;
    const to = `opacity-${sem}`;
    if (from === to) continue;
    out = replaceClass(out, from, to);
  }

  const duKeys = Object.keys(TW_NUM_DURATION_MS).sort(
    (a, b) => b.length - a.length,
  );
  for (const key of duKeys) {
    const sem = semanticForDurationTailwindKey(key);
    if (!sem) continue;
    const from = `duration-${key}`;
    const to = `duration-${sem}`;
    if (from === to) continue;
    out = replaceClass(out, from, to);
  }

  if (out !== s) {
    fs.writeFileSync(full, out, "utf8");
    return true;
  }
  return false;
}

function walk(dir) {
  const names = fs.readdirSync(dir);
  const changed = [];
  for (const n of names) {
    if (!n.endsWith(".tsx") && !n.endsWith(".ts")) continue;
    const rel = n;
    if (patchFile(rel)) changed.push(rel);
  }
  return changed;
}

const changed = walk(STARTER);
console.log(
  changed.length
    ? `Updated ${changed.length} file(s):\n${changed.join("\n")}`
    : "No spacing/opacity/duration numeric classes to replace.",
);
