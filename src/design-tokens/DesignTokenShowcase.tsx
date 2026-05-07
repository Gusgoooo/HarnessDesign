import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isColorTokenRow } from "@/design-tokens/color-token-utils";
import { cn } from "@/lib/utils";
import tokensRoot from "@/design-tokens/tokens.json";
import { tokensByCategory, type DesignTokenEntry } from "@/design-tokens/token-registry";

function groupByCategory(rows: DesignTokenEntry[]): Record<string, DesignTokenEntry[]> {
  const map: Record<string, DesignTokenEntry[]> = {};
  for (const t of rows) {
    const k = t.category || "other";
    if (!map[k]) map[k] = [];
    map[k].push(t);
  }
  return map;
}

function TokenSwatch({
  token,
  onPick,
  selected,
}: {
  token: DesignTokenEntry;
  onPick?: (field: "light" | "dark") => void;
  selected?: { field: "light" | "dark" } | null;
}) {
  const isRadius = token.category === "radius" || token.category === "radius-scale" || token.id === "radius";
  const colorRow = isColorTokenRow(token.light, token.dark);

  if (token.category === "elevation") {
    return (
      <div
        className="flex h-12 w-16 items-center justify-center rounded-md border border-border bg-card"
        style={{ boxShadow: `var(--${token.id})` }}
        title={`var(--${token.id})`}
      />
    );
  }
  if (isRadius) {
    const wrap = (
      <div
        className={cn(
          "flex h-12 w-16 items-center justify-center border border-border bg-muted/30",
          onPick && "cursor-pointer transition-opacity hover:opacity-90",
          selected?.field === "light" && "ring-2 ring-primary ring-offset-2",
        )}
        style={{ borderRadius: `var(--${token.id})` }}
        title={onPick ? "点击编辑（Light）" : `var(--${token.id})`}
      />
    );
    if (onPick) {
      return (
        <button type="button" className="block border-0 bg-transparent p-0" onClick={() => onPick("light")}>
          {wrap}
        </button>
      );
    }
    return wrap;
  }
  if (token.category === "spacing" || token.category === "layout" || token.category === "typography") {
    const wrap = (
      <div
        className={cn(
          "flex h-12 w-16 items-center justify-center rounded-md border border-dashed border-border bg-muted/20 font-mono text-[10px] text-muted-foreground",
          onPick && "cursor-pointer transition-opacity hover:opacity-90",
          selected?.field === "light" && "ring-2 ring-primary ring-offset-2",
        )}
        title={onPick ? "点击编辑（Light）" : `var(--${token.id})`}
      >
        —
      </div>
    );
    if (onPick) {
      return (
        <button type="button" className="block border-0 bg-transparent p-0" onClick={() => onPick("light")}>
          {wrap}
        </button>
      );
    }
    return wrap;
  }

  const swatch = (
    <div
      className={cn(
        "h-12 w-16 shrink-0 rounded-md border border-border",
        colorRow && onPick && "cursor-pointer transition-opacity hover:opacity-90",
        colorRow && selected?.field === "light" && "ring-2 ring-primary ring-offset-2",
      )}
      style={{ background: `var(--${token.id})` }}
      title={colorRow && onPick ? "点击弹出窗口编辑 OKLCH（Light）" : `var(--${token.id})`}
    />
  );

  if (colorRow && onPick) {
    return (
      <button type="button" className="block border-0 bg-transparent p-0" onClick={() => onPick("light")}>
        {swatch}
      </button>
    );
  }
  return swatch;
}

const cellMono =
  "min-w-0 align-top font-mono text-sm [overflow-wrap:anywhere] break-words text-foreground tabular-nums";
const cellMonoMuted =
  "min-w-0 align-top font-mono text-sm [overflow-wrap:anywhere] break-words text-muted-foreground tabular-nums";

function TableFrame({ children }: { children: React.ReactNode }) {
  return <div className="w-full overflow-hidden rounded-md border">{children}</div>;
}

function TokenTable({
  tokens,
  title,
  description,
  onTokenPick,
  selection,
}: {
  tokens: DesignTokenEntry[];
  title: string;
  description?: string;
  onTokenPick?: (token: DesignTokenEntry, field: "light" | "dark") => void;
  selection?: { tokenId: string; field: "light" | "dark" } | null;
}) {
  return (
    <section className="w-full min-w-0 max-w-none space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">预览</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>CSS 变量</TableHead>
              <TableHead>Light 源值</TableHead>
              <TableHead>Dark 源值</TableHead>
              <TableHead>Tailwind 语义类</TableHead>
              <TableHead>试点映射</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((t) => {
              const sel = selection?.tokenId === t.id ? selection : null;
              return (
                <TableRow key={t.id} data-state={sel ? "selected" : undefined}>
                  <TableCell className="align-middle">
                    <TokenSwatch
                      token={t}
                      onPick={onTokenPick ? (field) => onTokenPick(t, field) : undefined}
                      selected={sel}
                    />
                  </TableCell>
                  <TableCell className={cellMono}>{t.id}</TableCell>
                  <TableCell className={cellMonoMuted}>{`var(--${t.id})`}</TableCell>
                  <TableCell className={cellMonoMuted}>
                    {onTokenPick ? (
                      <button
                        type="button"
                        className={cn(
                          "w-full rounded-md px-1.5 py-1 text-left font-mono text-sm leading-snug hover:bg-muted/80",
                          sel?.field === "light" && "bg-primary/15 ring-1 ring-primary",
                        )}
                        title="编辑 Light"
                        onClick={() => onTokenPick(t, "light")}
                      >
                        {t.light}
                      </button>
                    ) : (
                      <span className="block font-mono text-sm leading-snug" title={t.light}>
                        {t.light}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className={cellMonoMuted}>
                    {onTokenPick ? (
                      <button
                        type="button"
                        className={cn(
                          "w-full rounded-md px-1.5 py-1 text-left font-mono text-sm leading-snug hover:bg-muted/80",
                          sel?.field === "dark" && "bg-primary/15 ring-1 ring-primary",
                        )}
                        title="编辑 Dark"
                        onClick={() => onTokenPick(t, "dark")}
                      >
                        {t.dark}
                      </button>
                    ) : (
                      <span className="block font-mono text-sm leading-snug" title={t.dark}>
                        {t.dark}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className={cellMono}>{t.tailwindClass}</TableCell>
                  <TableCell className={cellMonoMuted}>{t.usedBy?.length ? t.usedBy.join("、") : "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableFrame>
    </section>
  );
}

function StoryBindingsTable() {
  const sb = (tokensRoot as { storyBindings?: Record<string, { tokenId: string; label?: string; value: string }[]> }).storyBindings;
  if (!sb) return null;
  const rows = Object.entries(sb).flatMap(([group, opts]) => opts.map((o) => ({ group, ...o })));
  return (
    <section className="w-full min-w-0 space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Story Controls 绑定</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1 font-mono text-xs">storyBindings</code>：Controls 展示{" "}
          <code className="font-mono text-xs">tokenId</code>，运行时再映射为组件 prop。
        </p>
      </div>
      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>分组</TableHead>
              <TableHead>tokenId</TableHead>
              <TableHead>标签</TableHead>
              <TableHead>映射值</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${r.group}-${r.tokenId}`}>
                <TableCell className={cellMono}>{r.group}</TableCell>
                <TableCell className={cellMono}>{r.tokenId}</TableCell>
                <TableCell className={cellMonoMuted}>{r.label ?? "—"}</TableCell>
                <TableCell className={cellMonoMuted}>{r.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableFrame>
    </section>
  );
}

export type DesignTokenShowcaseProps = {
  embedded?: boolean;
  liveTokens?: DesignTokenEntry[] | null;
  onColorPick?: (token: DesignTokenEntry, field: "light" | "dark") => void;
  colorSelection?: { tokenId: string; field: "light" | "dark" } | null;
};

const CATEGORY_ORDER = [
  "semantic",
  "spacing",
  "layout",
  "radius",
  "radius-scale",
  "elevation",
  "motion",
  "typography",
  "opacity",
  "border",
  "chart",
  "sidebar",
] as const;

const CATEGORY_TITLE: Partial<Record<string, string>> = {
  semantic: "Semantic",
  spacing: "Spacing",
  layout: "Layout",
  radius: "Radius",
  "radius-scale": "Radius scale",
  elevation: "Elevation",
  motion: "Motion",
  typography: "Typography",
  opacity: "Opacity",
  border: "Border",
  chart: "Chart",
  sidebar: "Sidebar",
};

export function DesignTokenShowcase({
  embedded,
  liveTokens,
  onColorPick,
  colorSelection,
}: DesignTokenShowcaseProps) {
  const grouped = liveTokens?.length ? groupByCategory(liveTokens) : tokensByCategory();

  const semanticList = grouped.semantic;
  const otherCategories = CATEGORY_ORDER.filter((k) => k !== "semantic" && grouped[k]?.length);

  return (
    <div
      className={cn(
        "w-full min-w-0 bg-background text-foreground",
        embedded ? "py-8" : "min-h-screen px-4 py-10 sm:px-6 lg:px-8",
      )}
    >
      <div className="flex w-full min-w-0 flex-col gap-12">
        {!embedded ? (
          <header className="w-full space-y-3 border-b border-border pb-8">
            <h1 className="text-3xl font-semibold tracking-tight">DesignToken</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              全局<strong>唯一</strong>来源为{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">src/design-tokens/tokens.json</code>
              ；保存后执行 <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">npm run sync:tokens</code>（已并入{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">npm run sync:harness</code>
              ）生成 <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">design-tokens.generated.css</code>。
              业务组件请使用 Tailwind 语义类，不要手写离散色值。
            </p>
          </header>
        ) : null}

        {semanticList?.length ? (
          <TokenTable
            title="Semantic（语义色）"
            description="与 Light/Dark 主题绑定的语义色；可点击色块或源值在文档弹窗中编辑（数据来自当前 JSON）。"
            tokens={semanticList}
            onTokenPick={onColorPick}
            selection={colorSelection}
          />
        ) : null}

        {otherCategories.map((k) => (
          <TokenTable
            key={k}
            title={CATEGORY_TITLE[k] ?? k}
            tokens={grouped[k]!}
            onTokenPick={onColorPick}
            selection={colorSelection}
          />
        ))}

        <StoryBindingsTable />
      </div>
    </div>
  );
}
