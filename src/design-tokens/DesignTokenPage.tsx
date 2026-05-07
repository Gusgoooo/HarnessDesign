import * as React from "react";
import { HexAlphaColorPicker, HexColorInput } from "react-colorful";
import { converter, formatCss, parse } from "culori";
import { X, RotateCcw, Copy, Check, Ruler, Save, Code } from "lucide-react";
import { Button } from "@/components/starter/button";
import { Input } from "@/components/starter/input";
import { Label } from "@/components/starter/label";
import { cn } from "@/lib/utils";
import tokensFallback from "./tokens.json";
import { DesignTokenShowcase } from "./DesignTokenShowcase";
import type { DesignTokenEntry } from "./token-registry";
import { detectTokenValueKind, parseCssLength, formatCssLength, type TokenValueKind } from "./token-value-type";

const toOklch = converter("oklch");
const toRgb = converter("rgb");

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function cssToHex8(cssColor: string): string {
  const p = parse(cssColor);
  if (!p) return "#000000ff";
  const rgb = toRgb(p);
  if (!rgb) return "#000000ff";
  const r = Math.round(clamp(rgb.r ?? 0, 0, 1) * 255);
  const g = Math.round(clamp(rgb.g ?? 0, 0, 1) * 255);
  const b = Math.round(clamp(rgb.b ?? 0, 0, 1) * 255);
  const a = typeof rgb.alpha === "number" ? Math.round(clamp(rgb.alpha, 0, 1) * 255) : 255;
  return `#${[r, g, b, a].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function hex8ToOklchCss(hex: string): string {
  const p = parse(hex);
  if (!p) return hex;
  const ok = toOklch(p);
  if (!ok) return hex;
  return formatCss(ok);
}

function formatRgba(cssColor: string): string {
  const p = parse(cssColor);
  if (!p) return "—";
  const rgb = toRgb(p);
  if (!rgb) return "—";
  const r = Math.round(clamp(rgb.r ?? 0, 0, 1) * 255);
  const g = Math.round(clamp(rgb.g ?? 0, 0, 1) * 255);
  const b = Math.round(clamp(rgb.b ?? 0, 0, 1) * 255);
  const a = typeof rgb.alpha === "number" ? clamp(rgb.alpha, 0, 1) : 1;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2).replace(/\.?0+$/, "")})`;
}

type TokenRow = {
  id: string;
  category?: string;
  light: string;
  dark: string;
  tailwindClass?: string;
  usedBy?: string[];
  emitCss?: boolean;
};

type TokensDoc = {
  version?: number;
  tokens: TokenRow[];
  storyBindings?: unknown;
};

/* ── Length slider 范围自适应 ── */
const UNIT_RANGES: Record<string, { min: number; max: number; step: number }> = {
  rem: { min: 0, max: 5, step: 0.0625 },
  em: { min: 0, max: 5, step: 0.0625 },
  px: { min: 0, max: 100, step: 1 },
  "%": { min: 0, max: 100, step: 1 },
};
const DEFAULT_RANGE = { min: 0, max: 10, step: 0.1 };

/* ── 颜色编辑器子组件 ── */
function ColorEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const hex8 = React.useMemo(() => cssToHex8(value || "#000000"), [value]);

  const oklchDisplay = React.useMemo(() => {
    const p = parse(value);
    if (!p) return "—";
    const o = toOklch(p);
    return o ? formatCss(o) : "—";
  }, [value]);

  const rgbaDisplay = React.useMemo(() => formatRgba(value), [value]);

  function handlePickerChange(newHex8: string) {
    onChange(hex8ToOklchCss(newHex8));
  }

  function handleCssInputCommit(text: string) {
    const p = parse(text);
    if (!p) return;
    onChange(formatCss(p));
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      <div className="flex shrink-0 flex-col items-center gap-3">
        <HexAlphaColorPicker
          color={hex8}
          onChange={handlePickerChange}
          style={{ width: 220, height: 220 }}
        />
        <HexColorInput
          color={hex8.slice(0, 7)}
          onChange={(h) => handlePickerChange(h + hex8.slice(7))}
          prefixed
          className="w-[220px] rounded-md border border-input bg-background px-3 py-1.5 text-center font-mono text-sm text-foreground shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div
          className="h-16 w-full rounded-lg border border-border shadow-inner"
          style={{ background: value || "transparent" }}
        />
        <div className="space-y-2.5 text-sm">
          <div>
            <span className="text-xs font-medium text-muted-foreground">OKLCH</span>
            <p className="mt-0.5 font-mono text-xs break-all text-foreground">{oklchDisplay}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">RGBA</span>
            <p className="mt-0.5 font-mono text-xs break-all text-foreground">{rgbaDisplay}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">HEX</span>
            <p className="mt-0.5 font-mono text-xs break-all text-foreground">{hex8.slice(0, 7)}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">CSS 颜色值</Label>
          <Input
            defaultValue={value}
            key={value}
            className="font-mono text-xs"
            spellCheck={false}
            autoComplete="off"
            onBlur={(e) => handleCssInputCommit(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCssInputCommit(e.currentTarget.value);
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── CSS 长度编辑器子组件 ── */
function LengthEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = parseCssLength(value);
  const num = parsed?.num ?? 0;
  const unit = parsed?.unit ?? "rem";
  const range = UNIT_RANGES[unit] ?? DEFAULT_RANGE;

  const [textVal, setTextVal] = React.useState(value);
  React.useEffect(() => setTextVal(value), [value]);

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const n = Number.parseFloat(e.target.value);
    if (Number.isFinite(n)) onChange(formatCssLength(n, unit));
  }

  function handleNumInput(e: React.ChangeEvent<HTMLInputElement>) {
    const n = Number.parseFloat(e.target.value);
    if (Number.isFinite(n) && n >= 0) onChange(formatCssLength(n, unit));
  }

  function commitTextInput() {
    const trimmed = textVal.trim();
    if (!trimmed) return;
    const p = parseCssLength(trimmed);
    if (p) {
      onChange(formatCssLength(p.num, p.unit));
    } else {
      onChange(trimmed);
    }
  }

  const previewSize = Math.min(Math.max(num * (unit === "px" ? 1 : 16), 0), 120);

  return (
    <div className="flex flex-col gap-6">
      {/* 可视化预览 */}
      <div className="flex items-center gap-4">
        <Ruler size={20} className="shrink-0 text-muted-foreground" />
        <div className="flex flex-1 items-end gap-3">
          <div
            className="rounded-md border border-border bg-primary/15 transition-all"
            style={{ width: `${previewSize}px`, height: "48px" }}
          />
          <span className="shrink-0 font-mono text-lg font-semibold text-foreground tabular-nums">
            {value}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          拖拽调节（{range.min}{unit} – {range.max}{unit}，步长 {range.step}{unit}）
        </Label>
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={range.step}
          value={num}
          onChange={handleSlider}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow"
        />
      </div>

      {/* 数值 + 单位 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">数值</Label>
          <Input
            type="number"
            min={0}
            step={range.step}
            value={num}
            onChange={handleNumInput}
            className="font-mono text-sm tabular-nums"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">单位</Label>
          <select
            value={unit}
            onChange={(e) => onChange(formatCssLength(num, e.target.value))}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            {["rem", "em", "px", "%"].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 原始文本输入 */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">CSS 值（自由输入）</Label>
        <Input
          value={textVal}
          onChange={(e) => setTextVal(e.target.value)}
          onBlur={commitTextInput}
          onKeyDown={(e) => { if (e.key === "Enter") commitTextInput(); }}
          className="font-mono text-xs"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

/* ── 通用文本编辑器子组件 ── */
function GenericEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [text, setText] = React.useState(value);
  React.useEffect(() => setText(value), [value]);

  function commit() {
    if (text.trim()) onChange(text.trim());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">当前值</Label>
        <p className="font-mono text-sm break-all text-foreground">{value}</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">新值</Label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
          className="font-mono text-sm"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

/* ── 根据值类型选择编辑器 ── */
function TokenValueEditor({
  kind,
  value,
  onChange,
}: {
  kind: TokenValueKind;
  value: string;
  onChange: (v: string) => void;
}) {
  switch (kind) {
    case "color":
      return <ColorEditor value={value} onChange={onChange} />;
    case "length":
      return <LengthEditor value={value} onChange={onChange} />;
    default:
      return <GenericEditor value={value} onChange={onChange} />;
  }
}

const KIND_LABEL: Record<TokenValueKind, string> = {
  color: "颜色",
  length: "长度 / 尺寸",
  generic: "通用",
};

/* ── 主页面 ── */

export function DesignTokenPage() {
  const [raw, setRaw] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saveApiAvailable, setSaveApiAvailable] = React.useState(false);
  const [picker, setPicker] = React.useState<{ tokenId: string; field: "light" | "dark" } | null>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [codeOpen, setCodeOpen] = React.useState(false);
  const codeDialogRef = React.useRef<HTMLDialogElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/design-tokens", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      setRaw(await res.text());
      setSaveApiAvailable(true);
    } catch {
      setRaw(JSON.stringify(tokensFallback as object, null, 2));
      setSaveApiAvailable(false);
      setStatus(
        "未命中保存 API（常见原因：① 使用 `storybook build` 的静态站点无 Node 中间件；② 未通过 `npm run storybook` 启动）。已加载打包内嵌的 tokens.json，可本地改文案；**写回磁盘**请在本仓库执行 `npm run storybook` 后再点「保存并同步」。",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const doc = React.useMemo((): TokensDoc | null => {
    try {
      return JSON.parse(raw) as TokensDoc;
    } catch {
      return null;
    }
  }, [raw]);

  function patchTokenField(tokenId: string, field: "light" | "dark", value: string) {
    if (!doc?.tokens) return;
    const tokens = doc.tokens.map((t) => (t.id === tokenId ? { ...t, [field]: value } : t));
    setRaw(JSON.stringify({ ...doc, tokens }, null, 2));
  }

  async function save() {
    setStatus(null);
    try {
      JSON.parse(raw);
    } catch (e) {
      setStatus(`JSON 无效：${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    if (!saveApiAvailable) {
      setStatus("当前环境无 /api/save-design-tokens，无法写盘。请运行 `npm run storybook` 后重试，或手动粘贴到 src/design-tokens/tokens.json。");
      return;
    }
    try {
      const res = await fetch("/api/save-design-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonText: raw }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error ?? res.statusText);
      setStatus("已保存并执行 sync:tokens（design-tokens.generated.css 已更新）。");
    } catch (e) {
      setStatus(`保存失败：${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const pickedRow = doc?.tokens.find((t) => t.id === picker?.tokenId);
  const tokenMissing = Boolean(picker && doc && !pickedRow);

  const currentValue =
    pickedRow && picker ? (picker.field === "light" ? pickedRow.light : pickedRow.dark) : "";

  const valueKind: TokenValueKind = React.useMemo(
    () => (currentValue ? detectTokenValueKind(currentValue) : "generic"),
    [currentValue],
  );

  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (picker) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [picker]);

  function closeDialog() {
    setPicker(null);
    setCopied(false);
  }

  React.useEffect(() => {
    const el = codeDialogRef.current;
    if (!el) return;
    if (codeOpen && !el.open) el.showModal();
    else if (!codeOpen && el.open) el.close();
  }, [codeOpen]);

  function resetPickedToBundledDefault() {
    if (!picker) return;
    const row = (tokensFallback as { tokens: TokenRow[] }).tokens.find((t) => t.id === picker.tokenId);
    const v = row?.[picker.field];
    if (typeof v === "string") patchTokenField(picker.tokenId, picker.field, v);
  }

  async function copyCurrentValue() {
    try {
      await navigator.clipboard.writeText(currentValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  }

  const liveTokens = (doc?.tokens as DesignTokenEntry[] | undefined) ?? undefined;

  return (
    <div className="not-prose flex min-h-[70vh] w-full min-w-0 flex-col text-foreground">
      <header className="w-full min-w-0 border-b border-border px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full min-w-0 items-start justify-between gap-6">
          <div className="min-w-0 space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">DesignToken</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              全局唯一来源为 <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">src/design-tokens/tokens.json</code>
              。下方 JSON 与表格均反映<strong>当前</strong>文档内容；点击任意 token 值可弹窗编辑。
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setCodeOpen(true)}>
              <Code size={14} className="mr-1.5" />
              查看代码
            </Button>
            <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
              重新加载
            </Button>
            <Button type="button" onClick={() => void save()}>
              保存并同步
            </Button>
          </div>
        </div>
      </header>

      <div className="flex w-full min-w-0 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">

        <DesignTokenShowcase
          embedded
          liveTokens={liveTokens}
          onColorPick={(_token, field) => setPicker({ tokenId: _token.id, field })}
          colorSelection={picker}
        />
      </div>

      {/* ── Token 编辑弹框 ── */}
      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 z-50 m-0 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50"
        onClose={closeDialog}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog();
        }}
      >
        {pickedRow && picker && !tokenMissing ? (
          <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* 标题栏：左右排版，无分割线 */}
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
              <div className="flex min-w-0 items-center gap-3">
                <h2 className="truncate text-sm font-semibold text-foreground">
                  {picker.tokenId}
                </h2>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {picker.field === "light" ? "Light" : "Dark"} 模式
                </span>
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                  {KIND_LABEL[valueKind]}
                </span>
              </div>
              <button
                type="button"
                aria-label="关闭"
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={closeDialog}
              >
                <X size={16} />
              </button>
            </div>

            {/* 主体 */}
            <div className="px-5 pb-3">
              <TokenValueEditor
                kind={valueKind}
                value={currentValue}
                onChange={(v) => patchTokenField(pickedRow.id, picker.field, v)}
              />
            </div>

            {/* 底部操作栏 */}
            <div className="flex items-center gap-2 px-5 pb-5">
              <Button type="button" variant="outline" size="sm" onClick={resetPickedToBundledDefault}>
                <RotateCcw size={14} className="mr-1.5" />
                恢复默认
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => void copyCurrentValue()}>
                {copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                {copied ? "已复制" : "复制值"}
              </Button>
              <Button type="button" size="sm" className="ml-auto" onClick={() => void save()}>
                <Save size={14} className="mr-1.5" />
                保存
              </Button>
            </div>
          </div>
        ) : tokenMissing ? (
          <div className="p-6">
            <p className="text-sm text-destructive">当前 JSON 中不存在该 token，请修正或重新加载后再试。</p>
            <Button type="button" variant="outline" className="mt-4" onClick={closeDialog}>
              关闭
            </Button>
          </div>
        ) : null}
      </dialog>

      {/* ── 代码查看/编辑模态框 ── */}
      <dialog
        ref={codeDialogRef}
        className="fixed top-1/2 left-1/2 z-50 m-0 w-[calc(100vw-4rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50"
        onClose={() => setCodeOpen(false)}
        onClick={(e) => { if (e.target === codeDialogRef.current) setCodeOpen(false); }}
      >
        <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-foreground">tokens.json</h2>
              {saveApiAvailable ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">API 已连接</span>
              ) : (
                <span className="text-xs text-amber-600 dark:text-amber-400">只读内嵌</span>
              )}
            </div>
            <button
              type="button"
              aria-label="关闭"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setCodeOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 pb-4">
            {status ? (
              <div className="mb-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs whitespace-pre-wrap text-foreground">
                {status}
              </div>
            ) : null}
            {!doc ? (
              <p className="mb-3 text-xs text-destructive">JSON 无法解析，请检查语法。</p>
            ) : null}
            <textarea
              className="h-[min(60vh,480px)] w-full rounded-lg border border-input bg-background p-4 font-mono text-xs leading-relaxed text-foreground shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              spellCheck={false}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 px-5 pb-5">
            <Button type="button" variant="outline" size="sm" onClick={() => setCodeOpen(false)}>
              关闭
            </Button>
            <Button type="button" size="sm" onClick={() => { void save(); }}>
              <Save size={14} className="mr-1.5" />
              保存并同步
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
