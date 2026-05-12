/**
 * Tailwind ClassName → Token 自动审计（Storybook「Token 修改」控件）
 *
 * 用法：
 *   import src from './button.tsx?raw';
 *   const audit = autoClassControls(src);
 *   // audit.args / argTypes：已映射刻度 → `Token 修改 · 已绑定`（select）；
 *   //   未映射 → `Token 修改 · 未映射（可输入）`（text + 可选 token 下拉，可不绑定）；
 *   //   数字类但不在设计 spacing 刻度 → `Token 修改 · 未使用令牌（px 微调）`（number，提示未引用 token）
 *   // audit.buildClassName(args) → 根据控件值拼出覆盖 class 串
 *   // audit.entries → 完整审计（含非 token），nonTokenCount 供合规统计
 */

import spacingScale from "./spacing-scale.generated.json";

/* ================================================================== */
/*  1. Token 定义（与 @theme 保持一致）                                 */
/* ================================================================== */

const TOKEN_RADIUS: Record<string, string> = {
  none: "0px", sm: "4px", md: "6px", lg: "8px", xl: "12px", full: "9999px",
};

const TOKEN_SHADOW: Record<string, string> = {
  none: "none", xs: "xs", sm: "sm", DEFAULT: "DEFAULT", md: "md", lg: "lg",
};

const TOKEN_FONT_SIZE: Record<string, string> = {
  xs: "12px", sm: "14px", base: "16px", lg: "18px",
  xl: "20px", "2xl": "24px", "3xl": "30px",
};

const TOKEN_FONT_WEIGHT: Record<string, string> = {
  normal: "400", medium: "500", semibold: "600", bold: "700",
};

const TOKEN_OPACITY: Record<string, string> = {
  transparent: "0",
  subtle: "0.4",
  disabled: "0.5",
  muted: "0.7",
  opaque: "1",
};

const TOKEN_DURATION: Record<string, string> = {
  fast: "0.1s",
  "150": "0.15s",
  mid: "0.2s",
  slow: "0.3s",
  long: "0.5s",
  whole: "1s",
};

/** Tailwind 数字间距 → px（与 `spacing-scale.generated.json` / Modular seed 同源） */
const TW_NUM_SPACING_PX: Record<string, string> = spacingScale.suffixToPx as Record<string, string>;

/** Tailwind 默认圆角 → px */
const TW_NUM_RADIUS_PX: Record<string, string> = {
  none: "0px", sm: "2px", DEFAULT: "4px", md: "6px",
  lg: "8px", xl: "12px", "2xl": "16px", "3xl": "24px", full: "9999px",
};

const TW_NUM_FONT_SIZE_PX: Record<string, string> = {
  xs: "12px", sm: "14px", base: "16px", lg: "18px",
  xl: "20px", "2xl": "24px", "3xl": "30px", "4xl": "36px",
  "5xl": "48px", "6xl": "60px",
};

const TW_FONT_WEIGHT_NUM: Record<string, string> = {
  thin: "100", extralight: "200", light: "300", normal: "400",
  medium: "500", semibold: "600", bold: "700", extrabold: "800", black: "900",
};

const TW_NUM_OPACITY: Record<string, string> = {
  "0": "0", "5": "0.05", "10": "0.1", "15": "0.15", "20": "0.2",
  "25": "0.25", "30": "0.3", "35": "0.35", "40": "0.4", "45": "0.45",
  "50": "0.5", "55": "0.55", "60": "0.6", "65": "0.65", "70": "0.7",
  "75": "0.75", "80": "0.8", "85": "0.85", "90": "0.9", "95": "0.95", "100": "1",
};

const TW_NUM_DURATION_MS: Record<string, string> = {
  "0": "0s", "75": "0.075s", "100": "0.1s", "150": "0.15s",
  "200": "0.2s", "300": "0.3s", "500": "0.5s", "700": "0.7s", "1000": "1s",
};

/** @theme 注册的语义色名（bg-primary, text-foreground 等） */
const SEMANTIC_COLORS = new Set([
  "background", "foreground", "card", "card-foreground",
  "popover", "popover-foreground", "primary", "primary-foreground",
  "secondary", "secondary-foreground", "muted", "muted-foreground",
  "accent", "accent-foreground", "destructive", "destructive-foreground",
  "border", "input", "ring",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
  "sidebar", "sidebar-foreground", "sidebar-primary",
  "sidebar-primary-foreground", "sidebar-accent",
  "sidebar-accent-foreground", "sidebar-border", "sidebar-ring",
  "transparent", "current", "inherit", "white", "black",
]);

/* ================================================================== */
/*  2. 类名提取                                                        */
/* ================================================================== */

export function extractClasses(source: string): string[] {
  const raw: string[] = [];

  for (const m of source.matchAll(/className="([^"]+)"/g)) raw.push(m[1]);
  for (const m of source.matchAll(/className=\{`([^`]+)`\}/g)) raw.push(m[1]);

  for (const m of source.matchAll(/(?:cn|cva)\(([\s\S]*?)\n\s*\)/gm)) {
    const body = m[1];
    for (const s of body.matchAll(/"([^"]+)"/g)) raw.push(s[1]);
    for (const s of body.matchAll(/`([^`]+)`/g)) raw.push(s[1]);
  }
  for (const m of source.matchAll(/(?:cn|cva)\(([^\n)]*)\)/g)) {
    const body = m[1];
    for (const s of body.matchAll(/"([^"]+)"/g)) raw.push(s[1]);
    for (const s of body.matchAll(/`([^`]+)`/g)) raw.push(s[1]);
  }

  for (const m of source.matchAll(/:\s*"([^"]{4,})"/g)) {
    if (m[1].includes(" ") || /^[a-z]+-/.test(m[1])) raw.push(m[1]);
  }

  const all = raw.flatMap((s) =>
    s.split(/\s+/).filter((c) => c && !c.startsWith("${")),
  );
  return [...new Set(all)];
}

/* ================================================================== */
/*  3. 类名分类 & Token 匹配                                           */
/* ================================================================== */

export type AuditCategory =
  | "spacing" | "radius" | "shadow" | "fontSize" | "fontWeight"
  | "textColor" | "bgColor" | "borderColor" | "opacity" | "duration"
  | "layout" | "other";

export type AuditEntry = {
  raw: string;
  category: AuditCategory;
  prefix: string;
  value: string;
  isToken: boolean;
  cssValue: string;
  equivalentToken: string | null;
  adjustable: boolean;
};


function parsePx(css: string): number | null {
  const m = /^([\d.]+)px$/i.exec(String(css).trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

/** 在给定语义 token→px 映射中，选择与目标最接近的 key；并列时优先较大 px（「就近偏大」）。 */
export function nearestTokenKeyPreferLarger(
  targetPx: number,
  tokens: Record<string, string>,
): string | null {
  let bestKey: string | null = null;
  let bestDist = Infinity;
  let bestPx = -Infinity;
  for (const [k, css] of Object.entries(tokens)) {
    const px = parsePx(css);
    if (px == null) continue;
    const dist = Math.abs(targetPx - px);
    if (dist < bestDist || (dist === bestDist && px > bestPx)) {
      bestKey = k;
      bestDist = dist;
      bestPx = px;
    }
  }
  return bestKey;
}

function parseCssSeconds(s: string): number | null {
  const t = String(s).trim().toLowerCase();
  const m = /^([\d.]+)s$/i.exec(t);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

/** 不透明度的绝对值在 [0,1]，并列时优先较大的语义值（更「实」的一侧）。 */
function nearestOpacitySemantic(target: number): string | null {
  let bestK: string | null = null;
  let bestD = Infinity;
  let bestN = -Infinity;
  for (const [k, v] of Object.entries(TOKEN_OPACITY)) {
    const n = Number(String(v));
    if (!Number.isFinite(n)) continue;
    const d = Math.abs(target - n);
    if (d < bestD || (d === bestD && n > bestN)) {
      bestK = k;
      bestD = d;
      bestN = n;
    }
  }
  return bestK;
}

/** 动画时长就近语义（并列取较大时长）。 */
function nearestDurationSemantic(targetSec: number): string | null {
  let bestK: string | null = null;
  let bestD = Infinity;
  let bestS = -Infinity;
  for (const [k, v] of Object.entries(TOKEN_DURATION)) {
    const s = parseCssSeconds(v);
    if (s == null) continue;
    const d = Math.abs(targetSec - s);
    if (d < bestD || (d === bestD && s > bestS)) {
      bestK = k;
      bestD = d;
      bestS = s;
    }
  }
  return bestK;
}

/** 字号：px 映射上的就近偏大（仅用于非精确匹配）。 */
function nearestFontSizeSemantic(targetPx: number): string | null {
  let bestKey: string | null = null;
  let bestDist = Infinity;
  let bestPx = -Infinity;
  for (const [k, cssv] of Object.entries(TOKEN_FONT_SIZE)) {
    const px = parsePx(cssv);
    if (px == null) continue;
    const d = Math.abs(targetPx - px);
    if (d < bestDist || (d === bestDist && px > bestPx)) {
      bestKey = k;
      bestDist = d;
      bestPx = px;
    }
  }
  return bestKey;
}

/** 字重数值就近语义（并列取较大粗细）。 */
function nearestFontWeightSemantic(target: number): string | null {
  let bestK: string | null = null;
  let bestD = Infinity;
  let bestN = -Infinity;
  for (const [k, v] of Object.entries(TOKEN_FONT_WEIGHT)) {
    const n = Number(v);
    if (!Number.isFinite(n)) continue;
    const d = Math.abs(target - n);
    if (d < bestD || (d === bestD && n > bestN)) {
      bestK = k;
      bestD = d;
      bestN = n;
    }
  }
  return bestK;
}

function findEquivalent(
  cssVal: string,
  tokens: Record<string, string>,
): string | null {
  for (const [k, v] of Object.entries(tokens)) {
    if (v === cssVal) return k;
  }
  return null;
}

const NUMERIC_SPACING_SUFFIX = /^\d+(\.\d+)?$/;

function auditSpacingOrSizing(
  cls: string,
  prefix: string,
  val: string,
): AuditEntry | null {
  const skip = new Set([
    "auto", "full", "screen", "fit", "min", "max", "prose",
  ]);
  if (skip.has(val)) return null;
  if (val.includes("/")) return null;
  if (val.startsWith("[")) return arb(cls, "spacing", prefix, val);

  if (!(val in TW_NUM_SPACING_PX)) return null;

  return {
    raw: cls,
    category: "spacing",
    prefix,
    value: val,
    isToken: true,
    cssValue: TW_NUM_SPACING_PX[val],
    equivalentToken: null,
    adjustable: true,
  };
}

/**
 * Tailwind 默认 spacing(n)=n×0.25rem；在 16px root 下即 n×4px。
 * 用于「刻度后缀不在 design spacing-scale 内」时的 px 估算与 Storybook 微调。
 */
function tailwindDefaultSpacingToPx(n: number): number {
  return n * 4;
}

/** 数字刻度类（如 h-9、gap-7）但后缀不在 `spacing-scale.generated` 中时，视为未引用 spacing 设计令牌。 */
function auditNumericOutsideDesignSpacingToken(
  cls: string,
  prefix: string,
  val: string,
): AuditEntry | null {
  const skip = new Set([
    "auto", "full", "screen", "fit", "min", "max", "prose",
  ]);
  if (skip.has(val)) return null;
  if (val.includes("/")) return null;
  if (val.startsWith("[")) return null;
  if (!NUMERIC_SPACING_SUFFIX.test(val)) return null;

  const n = Number(val);
  if (!Number.isFinite(n)) return null;

  const pxNum = tailwindDefaultSpacingToPx(n);
  const cssValue = `${pxNum}px`;
  const nearest = nearestTokenKeyPreferLarger(pxNum, TW_NUM_SPACING_PX);

  return {
    raw: cls,
    category: "layout",
    prefix,
    value: val,
    isToken: false,
    cssValue,
    equivalentToken: nearest,
    adjustable: true,
  };
}

const SPACING_PREFIXES =
  /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|inset-x|inset-y|inset|top|right|bottom|left|size|min-w|max-w|min-h|max-h|w|h)-(.+)$/;
const RADIUS_RE = /^rounded(?:-(tl|tr|bl|br|t|r|b|l|s|e|ss|se|es|ee))?(?:-(.+))?$/;

export function auditClass(cls: string): AuditEntry | null {
  if (/^[\w[\]-]+:/.test(cls)) return null;
  if (cls.startsWith("-")) {
    const result = auditClass(cls.slice(1));
    if (result) return { ...result, raw: cls, prefix: "-" + result.prefix };
    return null;
  }

  // --- Spacing / sizing utilities（与 `@theme --spacing-{n}` 数字刻度一致）
  const spM = cls.match(SPACING_PREFIXES);
  if (spM) {
    const [, prefix, val] = spM;
    if (prefix === "min-w" || prefix === "max-w") return null;
    const row = auditSpacingOrSizing(cls, prefix, val);
    if (row) return row;
    const layoutRow = auditNumericOutsideDesignSpacingToken(cls, prefix, val);
    if (layoutRow) return layoutRow;
  }

  // --- Border Radius ---
  const rdM = cls.match(RADIUS_RE);
  if (rdM) {
    const sub = rdM[1] ?? "";
    const val = rdM[2] ?? "DEFAULT";
    const prefix = sub ? `rounded-${sub}` : "rounded";
    if (val.startsWith("[")) return arb(cls, "radius", prefix, val);
    const cssVal =
      val in TOKEN_RADIUS
        ? TOKEN_RADIUS[val]
        : (TW_NUM_RADIUS_PX[val] ?? "?");
    const px = parsePx(cssVal);
    const exactName = findEquivalent(cssVal, TOKEN_RADIUS);
    const nearest =
      px != null ? nearestTokenKeyPreferLarger(px, TOKEN_RADIUS) : null;
    const equiv = exactName ?? nearest;
    const isToken = exactName !== null && exactName === val;
    return {
      raw: cls,
      category: "radius",
      prefix,
      value: val,
      isToken,
      cssValue: cssVal,
      equivalentToken: isToken ? null : equiv,
      adjustable: true,
    };
  }

  // --- Shadow ---
  const shM = cls.match(/^shadow(?:-(.+))?$/);
  if (shM) {
    const val = shM[1] ?? "DEFAULT";
    if (val.startsWith("[")) return arb(cls, "shadow", "shadow", val);
    const isToken = val in TOKEN_SHADOW;
    return {
      raw: cls,
      category: "shadow",
      prefix: "shadow",
      value: val,
      isToken,
      cssValue: val,
      equivalentToken: null,
      adjustable: true,
    };
  }

  // --- Font Size ---
  const fsM = cls.match(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/);
  if (fsM) {
    const val = fsM[1];
    const cssVal = TW_NUM_FONT_SIZE_PX[val] ?? "?";
    const px = parsePx(cssVal);
    const exactName = findEquivalent(cssVal, TOKEN_FONT_SIZE);
    const nearest =
      px != null ? nearestFontSizeSemantic(px) : null;
    const equiv = exactName ?? nearest;
    const isToken = exactName !== null && exactName === val;
    return {
      raw: cls,
      category: "fontSize",
      prefix: "text",
      value: val,
      isToken,
      cssValue: cssVal,
      equivalentToken: isToken ? null : equiv,
      adjustable: true,
    };
  }

  // --- Font Weight ---
  const fwM = cls.match(
    /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
  );
  if (fwM) {
    const val = fwM[1];
    const cssStr = TW_FONT_WEIGHT_NUM[val] ?? "?";
    const n = Number(cssStr);
    const exactName = findEquivalent(cssStr, TOKEN_FONT_WEIGHT);
    const nearest = Number.isFinite(n)
      ? nearestFontWeightSemantic(n)
      : null;
    const equiv = exactName ?? nearest;
    const isToken = exactName !== null && exactName === val;
    return {
      raw: cls,
      category: "fontWeight",
      prefix: "font",
      value: val,
      isToken,
      cssValue: cssStr,
      equivalentToken: isToken ? null : equiv,
      adjustable: true,
    };
  }

  // --- Opacity ---
  const opM = cls.match(/^opacity-(.+)$/);
  if (opM) {
    const val = opM[1];
    if (val.startsWith("[")) return arb(cls, "opacity", "opacity", val);
    if (val in TOKEN_OPACITY) {
      return {
        raw: cls,
        category: "opacity",
        prefix: "opacity",
        value: val,
        isToken: true,
        cssValue: TOKEN_OPACITY[val],
        equivalentToken: null,
        adjustable: true,
      };
    }
    const cssStr =
      val in TW_NUM_OPACITY ? TW_NUM_OPACITY[val] ?? "?" : "?";
    const n = Number(cssStr);
    const exactName =
      cssStr !== "?"
        ? findEquivalent(cssStr, TOKEN_OPACITY)
        : null;
    const nearest = Number.isFinite(n)
      ? nearestOpacitySemantic(n)
      : null;
    const equiv = exactName ?? nearest;
    const isToken = false;
    return {
      raw: cls,
      category: "opacity",
      prefix: "opacity",
      value: val,
      isToken,
      cssValue: cssStr,
      equivalentToken: equiv,
      adjustable: true,
    };
  }

  // --- Duration ---
  const duM = cls.match(/^duration-(.+)$/);
  if (duM) {
    const val = duM[1];
    if (val.startsWith("[")) return arb(cls, "duration", "duration", val);
    const cssStr =
      val in TOKEN_DURATION
        ? TOKEN_DURATION[val]
        : (TW_NUM_DURATION_MS[val] ?? "?");
    const secs = parseCssSeconds(cssStr);
    const exactName =
      cssStr !== "?" ? findEquivalent(cssStr, TOKEN_DURATION) : null;
    const nearest =
      secs != null ? nearestDurationSemantic(secs) : null;
    const equiv = exactName ?? nearest;
    const isToken = exactName !== null && exactName === val;
    return {
      raw: cls,
      category: "duration",
      prefix: "duration",
      value: val,
      isToken,
      cssValue: cssStr,
      equivalentToken: isToken ? null : equiv,
      adjustable: true,
    };
  }

  // --- Text Color ---
  const tcM = cls.match(/^text-([\w-]+?)(?:\/([\d]+))?$/);
  if (tcM && !TW_NUM_FONT_SIZE_PX[tcM[1]]) {
    const val = tcM[1];
    const isToken = SEMANTIC_COLORS.has(val) || SEMANTIC_COLORS.has(val.replace("-foreground", ""));
    return { raw: cls, category: "textColor", prefix: "text", value: val, isToken, cssValue: val, equivalentToken: null, adjustable: true };
  }

  // --- Background Color ---
  const bgM = cls.match(/^bg-([\w-]+?)(?:\/([\d]+))?$/);
  if (bgM) {
    const val = bgM[1];
    const isToken = SEMANTIC_COLORS.has(val);
    return { raw: cls, category: "bgColor", prefix: "bg", value: val, isToken, cssValue: val, equivalentToken: null, adjustable: true };
  }

  // --- Border Color ---
  const bcM = cls.match(/^border-([\w-]+?)(?:\/([\d]+))?$/);
  if (bcM && !["solid", "dashed", "dotted", "0", "2", "4", "8"].includes(bcM[1])) {
    const val = bcM[1];
    const isToken = SEMANTIC_COLORS.has(val);
    return { raw: cls, category: "borderColor", prefix: "border", value: val, isToken, cssValue: val, equivalentToken: null, adjustable: true };
  }

  return null;
}

function arb(
  raw: string, category: AuditCategory, prefix: string, val: string,
): AuditEntry {
  return { raw, category, prefix, value: val, isToken: false, cssValue: val, equivalentToken: null, adjustable: false };
}

/* ================================================================== */
/*  4. 自动生成 Storybook Controls                                     */
/* ================================================================== */

type CategoryMeta = {
  tokens: Record<string, string>;
  label: string;
  /** 生成 className，e.g. (prefix, key) => `${prefix}-${key}` */
  makeClass: (prefix: string, key: string) => string;
};

const CATEGORY_BOUND = "Token 修改 · 已绑定";
const CATEGORY_UNMAPPED = "Token 修改 · 未映射";
const CATEGORY_LAYOUT_NON_TOKEN = "Token 修改 · px 微调";

function readPxArg(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function makeLayoutPxClass(prefix: string, px: number): string {
  if (!/^[\w-]+$/.test(prefix)) return "";
  return `${prefix}-[${px}px]`;
}

/** 允许在「未映射」文本框中填写的 Tailwind 刻度后缀 / arbitrary 片段（防注入） */
function isSafeTailwindSuffix(s: string): boolean {
  return /^[\w.[\]\/-]+$/.test(s);
}

/**
 * Tailwind 工具类前缀 → Controls「名称」列简短中文（与内部 args 键 `controlId` 无关）。
 * 未列出的前缀在运行时按 category 回退。
 */
const SPACING_PREFIX_LABEL_ZH: Record<string, string> = {
  p: "全向内边距",
  px: "左右内边距",
  py: "上下内边距",
  pt: "上内边距",
  pb: "下内边距",
  pl: "左内边距",
  pr: "右内边距",
  m: "全向外边距",
  mx: "左右外边距",
  my: "上下外边距",
  mt: "上外边距",
  mb: "下外边距",
  ml: "左外边距",
  mr: "右外边距",
  gap: "元素间距",
  "gap-x": "横向元素间距",
  "gap-y": "纵向元素间距",
  "space-x": "子项横向间隔",
  "space-y": "子项纵向间隔",
  "inset-x": "左右内缩",
  "inset-y": "上下内缩",
  inset: "四向内缩",
  top: "距顶偏移",
  right: "距右偏移",
  bottom: "距底偏移",
  left: "距左偏移",
  size: "宽高同值",
  w: "宽度",
  h: "高度",
  "min-w": "最小宽度",
  "max-w": "最大宽度",
  "min-h": "最小高度",
  "max-h": "最大高度",
};

const RADIUS_PREFIX_LABEL_ZH: Record<string, string> = {
  rounded: "圆角",
  "rounded-t": "顶边圆角",
  "rounded-r": "右侧圆角",
  "rounded-b": "底边圆角",
  "rounded-l": "左侧圆角",
  "rounded-tl": "左上角",
  "rounded-tr": "右上角",
  "rounded-bl": "左下角",
  "rounded-br": "右下角",
  "rounded-ss": "起角圆角",
  "rounded-se": "止前圆角",
  "rounded-es": "止后圆角",
  "rounded-ee": "对角圆角",
};

const CATEGORY_FALLBACK_LABEL_ZH: Record<AuditCategory, string> = {
  spacing: "间距",
  layout: "间距",
  radius: "圆角",
  shadow: "阴影",
  fontSize: "字号",
  fontWeight: "字重",
  textColor: "文字色",
  bgColor: "背景色",
  borderColor: "边框色",
  opacity: "透明度",
  duration: "动画时长",
  other: "样式",
};

/** 与 autoClassControls 一致：Tailwind spacing/sizing 前缀 → Controls 名称列 */
export function spacingUtilityPrefixLabelZh(prefix: string): string {
  const neg = prefix.startsWith("-");
  const p = neg ? prefix.slice(1) : prefix;
  const base = SPACING_PREFIX_LABEL_ZH[p];
  if (!base) return prefix;
  return neg ? `${base}·负` : base;
}

function controlNameZh(entry: AuditEntry): string {
  const p = entry.prefix.startsWith("-")
    ? entry.prefix.slice(1)
    : entry.prefix;
  const neg = entry.prefix.startsWith("-");
  let title: string | undefined;
  if (entry.category === "spacing" || entry.category === "layout") {
    title = SPACING_PREFIX_LABEL_ZH[p];
  } else if (entry.category === "radius") {
    title = RADIUS_PREFIX_LABEL_ZH[entry.prefix] ?? RADIUS_PREFIX_LABEL_ZH[p];
  } else if (entry.category === "shadow") {
    title = "阴影";
  } else if (entry.category === "fontSize") {
    title = "字号";
  } else if (entry.category === "fontWeight") {
    title = "字重";
  } else if (entry.category === "opacity") {
    title = "透明度";
  } else if (entry.category === "duration") {
    title = "动画时长";
  } else if (entry.category === "textColor") {
    title = `文字色·${entry.value}`;
  } else if (entry.category === "bgColor") {
    title = `背景色·${entry.value}`;
  } else if (entry.category === "borderColor") {
    title = `边框色·${entry.value}`;
  }
  if (!title) title = CATEGORY_FALLBACK_LABEL_ZH[entry.category] ?? p;
  return neg ? `${title}·负` : title;
}

/** 语义色下拉选项（bg-/text-/border- 通用） */
const TOKEN_SEMANTIC_COLOR: Record<string, string> = {
  background: "页面背景",
  foreground: "默认前景",
  card: "卡片背景",
  "card-foreground": "卡片前景",
  popover: "弹出背景",
  "popover-foreground": "弹出前景",
  primary: "主色",
  "primary-foreground": "主色前景",
  secondary: "次级填充",
  "secondary-foreground": "次级前景",
  muted: "弱化背景",
  "muted-foreground": "弱化前景",
  accent: "强调填充",
  "accent-foreground": "强调前景",
  destructive: "危险色",
  "destructive-foreground": "危险前景",
  border: "边框",
  input: "输入框边框",
  ring: "焦点环",
  transparent: "透明",
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  spacing: {
    tokens: TW_NUM_SPACING_PX,
    label: "间距",
    makeClass: (p, k) =>
      k === "0" ? `${p}-0` : k === "px" ? `${p}-px` : `${p}-${k}`,
  },
  radius: {
    tokens: TOKEN_RADIUS,
    label: "圆角",
    makeClass: (p, k) => (k === "none" ? `${p}-none` : k === "full" ? `${p}-full` : `${p}-${k}`),
  },
  shadow: {
    tokens: TOKEN_SHADOW,
    label: "阴影",
    makeClass: (_p, k) => (k === "none" ? "shadow-none" : k === "DEFAULT" ? "shadow" : `shadow-${k}`),
  },
  fontSize: {
    tokens: TOKEN_FONT_SIZE,
    label: "字号",
    makeClass: (_p, k) => `text-${k}`,
  },
  fontWeight: {
    tokens: TOKEN_FONT_WEIGHT,
    label: "字重",
    makeClass: (_p, k) => `font-${k}`,
  },
  opacity: {
    tokens: TOKEN_OPACITY,
    label: "透明度",
    makeClass: (_p, k) => `opacity-${k}`,
  },
  duration: {
    tokens: TOKEN_DURATION,
    label: "动画时长",
    makeClass: (_p, k) => `duration-${k}`,
  },
  textColor: {
    tokens: TOKEN_SEMANTIC_COLOR,
    label: "文字颜色",
    makeClass: (_p, k) => `text-${k}`,
  },
  bgColor: {
    tokens: TOKEN_SEMANTIC_COLOR,
    label: "背景颜色",
    makeClass: (_p, k) => `bg-${k}`,
  },
  borderColor: {
    tokens: TOKEN_SEMANTIC_COLOR,
    label: "边框颜色",
    makeClass: (_p, k) => `border-${k}`,
  },
};

function makeLabels(
  tokens: Record<string, string>,
  equivalentToken: string | null,
): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const [k, v] of Object.entries(tokens)) {
    let lbl = `${k} · ${v}`;
    if (equivalentToken === k) lbl += " ← 等值";
    labels[k] = lbl;
  }
  return labels;
}

/** Storybook `args` 传入 `buildClassName` 时的形状（含 number 控件的运行时值） */
export type ClassOverrideArgs = Record<string, string | number | undefined>;

/** Story 侧把 token 覆盖路由到正确 DOM：根 `className` 与（若有）`classNames` 各槽 */
export type AutoPreviewProps = {
  className: string;
  classNames?: Record<string, string>;
  /**
   * 源码中第 2 个及之后的 `className={cn(` 槽上的覆盖类（与 `extractClassNameCnBodiesWithStart` 顺序一致）；
   * 第 1 个槽合并进 `className`。仅当文件中存在多个 `className={cn(` 时出现。
   */
  previewCnSlotOverrides?: string[];
};

export type AutoControlsResult = {
  entries: AuditEntry[];
  /** 与 Meta.args 兼容：全部为 string */
  args: Record<string, string>;
  argTypes: Record<string, unknown>;
  buildClassName: (runtimeArgs: ClassOverrideArgs) => string;
  /**
   * 将 `buildClassName` 的片段按源码中 `classNames.xxx: cn(...)` / 根 `className={cn(...)}` 分流，
   * 避免把 `gap-*` 等加在根节点而实际样式写在 `classNames.month` 上导致「改了控件没反应」。
   */
  buildPreview: (runtimeArgs: ClassOverrideArgs) => AutoPreviewProps;
  resolveArgTypes: (runtimeArgs: ClassOverrideArgs) => Record<string, unknown>;
  /** 非 token 条目总数 */
  nonTokenCount: number;
};

/** 供 Story 解构：`{...spreadAutoPreviewProps(audit, args)}` */
export function spreadAutoPreviewProps(
  audit: AutoControlsResult,
  args: ClassOverrideArgs,
): {
  className?: string;
  classNames?: Record<string, string>;
  previewCnSlotOverrides?: string[];
} {
  const p = audit.buildPreview(args);
  const out: {
    className?: string;
    classNames?: Record<string, string>;
    previewCnSlotOverrides?: string[];
  } = {};
  if (p.className.trim()) out.className = p.className;
  if (p.classNames && Object.keys(p.classNames).length > 0) out.classNames = p.classNames;
  if (p.previewCnSlotOverrides?.some((s) => s.trim())) {
    out.previewCnSlotOverrides = p.previewCnSlotOverrides;
  }
  return out;
}

const PREVIEW_ROOT = "__root__";

type ClassNamesObjectSlice = { absInnerStart: number; inner: string };

/** `classNames={{ ... }}` 内对象字面量正文（不含包裹它的 `{` `}`）及在源码中的起点 */
function sliceClassNamesObjectInner(source: string): ClassNamesObjectSlice | null {
  const o = source.indexOf("classNames={");
  if (o < 0) return null;
  let i = o + "classNames={".length;
  while (i < source.length && /\s/.test(source[i]!)) i++;
  if (source[i] !== "{") return null;
  i++;
  const absInnerStart = i;
  let depth = 1;
  while (i < source.length && depth > 0) {
    const c = source[i]!;
    if (c === "{") depth++;
    else if (c === "}") depth--;
    if (depth === 0) break;
    i++;
  }
  return { absInnerStart, inner: source.slice(absInnerStart, i) };
}

/** `classNames` 里 `key: cn( ... )` 各槽在源码中的 cn 参数区间（绝对下标） */
function extractClassNamesSlotRegions(
  source: string,
): { key: string; innerStart: number; innerEnd: number }[] {
  const sl = sliceClassNamesObjectInner(source);
  if (!sl) return [];
  const { absInnerStart, inner } = sl;
  const out: { key: string; innerStart: number; innerEnd: number }[] = [];
  const re = /(\w+):\s*cn\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(inner)) !== null) {
    const relStart = m.index + m[0].length;
    let j = absInnerStart + relStart;
    let depth = 1;
    while (j < source.length && depth > 0) {
      const c = source[j]!;
      if (c === "(") depth++;
      else if (c === ")") depth--;
      j++;
    }
    out.push({
      key: m[1],
      innerStart: absInnerStart + relStart,
      innerEnd: j - 1,
    });
  }
  return out;
}

/** 源码中所有 `className={cn( ... )}` 的 cn 参数体及起始下标 */
function extractClassNameCnBodiesWithStart(
  source: string,
): { start: number; body: string }[] {
  const needle = "className={cn(";
  const out: { start: number; body: string }[] = [];
  let pos = 0;
  while (pos < source.length) {
    const idx = source.indexOf(needle, pos);
    if (idx < 0) break;
    const innerStart = idx + needle.length;
    let j = innerStart;
    let depth = 1;
    while (j < source.length && depth > 0) {
      const c = source[j];
      if (c === "(") depth++;
      else if (c === ")") depth--;
      j++;
    }
    out.push({ start: innerStart, body: source.slice(innerStart, j - 1) });
    pos = j;
  }
  return out;
}

/** 根据源码判断该 token 槽应对应 `classNames` 的哪个 key，否则走根 `className` / 第 N 个 `className={cn(` */
function inferTokenPreviewSlot(source: string, entry: AuditEntry): string {
  const raw = entry.raw;
  const regions = extractClassNamesSlotRegions(source);
  for (let i = regions.length - 1; i >= 0; i--) {
    const r = regions[i];
    if (source.slice(r.innerStart, r.innerEnd).includes(raw)) return r.key;
  }
  const bodies = extractClassNameCnBodiesWithStart(source);
  for (let i = 0; i < bodies.length; i++) {
    if (bodies[i].body.includes(raw)) {
      return bodies.length === 1 || i === 0 ? PREVIEW_ROOT : `__cn_${i}`;
    }
  }
  return PREVIEW_ROOT;
}

/** `autoClassControls` 可选配置 */
export type AutoClassControlsOptions = {
  /**
   * 不在 Storybook Controls 中生成的 Tailwind **前缀**（如 `w`、`h`、`rounded`）。
   * 用于轨道/拇指尺寸、药丸圆角等由实现锁定、不应交给设计师改 spacing / shadow token 映射的场景。
   */
  hidePrefixes?: string[];
  /**
   * 正则模式列表（对应 spec.json 的 styleLock.blacklist[].pattern）。
   * 若 entry.raw 匹配任何模式则不生成控件。比 hidePrefixes 更精确。
   */
  hidePatterns?: RegExp[];
};

type SlotMeta =
  | {
      mode: "mapped";
      controlId: string;
      entry: AuditEntry;
      catMeta: CategoryMeta;
      previewSlot: string;
    }
  | {
      mode: "layoutPx";
      controlId: string;
      entry: AuditEntry;
      defaultPx: number;
      previewSlot: string;
    };

export function autoClassControls(
  source: string,
  options?: AutoClassControlsOptions,
): AutoControlsResult {
  const rawClasses = extractClasses(source);
  const allEntries: AuditEntry[] = [];
  for (const cls of rawClasses) {
    const entry = auditClass(cls);
    if (entry) allEntries.push(entry);
  }

  const seen = new Set<string>();
  const adjustable: AuditEntry[] = [];
  for (const e of allEntries) {
    if (!e.adjustable) continue;
    const slotKey =
      e.category === "layout"
        ? `layout::${e.prefix}::${e.value}`
        : e.category === "fontSize" || e.category === "fontWeight"
          ? `${e.category}::${e.prefix}::${e.value}`
          : e.category === "textColor" || e.category === "bgColor" || e.category === "borderColor"
            ? `${e.category}::${e.prefix}::${e.value}`
            : `${e.category}::${e.prefix}`;
    if (seen.has(slotKey)) continue;
    seen.add(slotKey);
    adjustable.push(e);
  }

  const hide = new Set(options?.hidePrefixes ?? []);
  const hidePatterns = options?.hidePatterns ?? [];
  const adjustableForControls = adjustable.filter((e) => {
    if (hide.size && hide.has(e.prefix)) return false;
    if (hidePatterns.length && hidePatterns.some((re) => re.test(e.raw))) return false;
    return true;
  });

  const args: Record<string, string> = {};
  const argTypes: Record<string, unknown> = {};
  const slotMeta: SlotMeta[] = [];

  for (const entry of adjustableForControls) {
    if (entry.category === "layout") {
      const px = parsePx(entry.cssValue);
      if (px == null) continue;
      const controlId = `layout_${entry.prefix.replace(/-/g, "_")}_${String(entry.value).replace(/\./g, "_")}`;
      const suggest =
        entry.equivalentToken != null
          ? `\n近似令牌：${entry.equivalentToken} = ${TW_NUM_SPACING_PX[entry.equivalentToken] ?? "?"}`
          : "";
      const desc =
        `源码类 ${entry.raw} ≈ ${entry.cssValue}，未绑定 spacing 令牌。${suggest}`;
      args[controlId] = String(px);
      argTypes[controlId] = {
        name: controlNameZh(entry),
        control: { type: "text" as const },
        description: desc,
        table: { category: CATEGORY_LAYOUT_NON_TOKEN },
      };
      slotMeta.push({
        mode: "layoutPx",
        controlId,
        entry,
        defaultPx: px,
        previewSlot: inferTokenPreviewSlot(source, entry),
      });
      continue;
    }

    const catMeta = CATEGORY_META[entry.category];
    if (!catMeta) continue;

    const controlId =
      entry.category === "fontSize" || entry.category === "fontWeight" ||
      entry.category === "textColor" || entry.category === "bgColor" || entry.category === "borderColor"
        ? `${entry.prefix.replace(/-/g, "_")}_${String(entry.value).replace(/[^a-zA-Z0-9]/g, "_")}`
        : entry.prefix.replace(/-/g, "_");
    const defaultKey = entry.value;
    const tokenKeys = Object.keys(catMeta.tokens);
    const labels = makeLabels(catMeta.tokens, null);

    if (entry.isToken) {
      const desc = `${catMeta.label} · 已对齐设计刻度 · ${entry.raw}`;
      args[controlId] = defaultKey;
      argTypes[controlId] = {
        name: controlNameZh(entry),
        control: { type: "select" as const, labels },
        options: [...tokenKeys],
        description: desc,
        table: { category: CATEGORY_BOUND },
      };
      slotMeta.push({
        mode: "mapped",
        controlId,
        entry,
        catMeta,
        previewSlot: inferTokenPreviewSlot(source, entry),
      });
      continue;
    }

    const allLabels: Record<string, string> = { ...labels };
    if (!tokenKeys.includes(defaultKey)) {
      allLabels[defaultKey] = `${defaultKey} (源码值)`;
    }
    const options = tokenKeys.includes(defaultKey)
      ? [...tokenKeys]
      : [defaultKey, ...tokenKeys];
    const desc = `${catMeta.label} · ${entry.raw}`;

    args[controlId] = defaultKey;
    argTypes[controlId] = {
      name: controlNameZh(entry),
      control: { type: "select" as const, labels: allLabels },
      options,
      description: desc,
      table: { category: CATEGORY_UNMAPPED },
    };

    slotMeta.push({
      mode: "mapped",
      controlId,
      entry,
      catMeta,
      previewSlot: inferTokenPreviewSlot(source, entry),
    });
  }

  function emitSlotOverride(
    slot: SlotMeta,
    runtimeArgs: ClassOverrideArgs,
  ): string | null {
    if (slot.mode === "layoutPx") {
      const n = readPxArg(runtimeArgs[slot.controlId]);
      if (n == null || n === slot.defaultPx) return null;
      const cls = makeLayoutPxClass(slot.entry.prefix, n);
      return cls || null;
    }
    const selected = runtimeArgs[slot.controlId];
    if (selected == null || selected === "" || selected === slot.entry.value)
      return null;
    return slot.catMeta.makeClass(slot.entry.prefix, String(selected));
  }

  function buildClassName(runtimeArgs: ClassOverrideArgs): string {
    const parts: string[] = [];
    for (const sm of slotMeta) {
      const cls = emitSlotOverride(sm, runtimeArgs);
      if (cls) parts.push(cls);
    }
    return parts.join(" ");
  }

  function buildPreview(runtimeArgs: ClassOverrideArgs): AutoPreviewProps {
    const buckets: Record<string, string[]> = {};
    for (const sm of slotMeta) {
      const cls = emitSlotOverride(sm, runtimeArgs);
      if (!cls) continue;
      const key = sm.previewSlot;
      (buckets[key] ??= []).push(cls);
    }
    const className = (buckets[PREVIEW_ROOT] ?? []).join(" ");
    const classNames: Record<string, string> = {};
    for (const [k, arr] of Object.entries(buckets)) {
      if (k === PREVIEW_ROOT || k.startsWith("__cn_")) continue;
      const s = arr.join(" ");
      if (s.trim()) classNames[k] = s;
    }
    const bodies = extractClassNameCnBodiesWithStart(source);
    let previewCnSlotOverrides: string[] | undefined;
    if (bodies.length > 1) {
      previewCnSlotOverrides = [];
      for (let i = 1; i < bodies.length; i++) {
        const slotKey = `__cn_${i}`;
        const s = (buckets[slotKey] ?? []).join(" ").trim();
        previewCnSlotOverrides.push(s);
      }
    }
    return {
      className,
      ...(Object.keys(classNames).length > 0 ? { classNames } : {}),
      ...(previewCnSlotOverrides?.length ? { previewCnSlotOverrides } : {}),
    };
  }

  function resolveArgTypes(_runtimeArgs: ClassOverrideArgs): Record<string, unknown> {
    return { ...argTypes };
  }

  const nonTokenCount = allEntries.filter((e) => !e.isToken).length;

  return {
    entries: allEntries,
    args,
    argTypes,
    buildClassName,
    buildPreview,
    resolveArgTypes,
    nonTokenCount,
  };
}
