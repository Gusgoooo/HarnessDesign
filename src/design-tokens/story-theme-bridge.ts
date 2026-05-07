import type { CSSProperties } from "react";
import { DESIGN_TOKENS, type DesignTokenEntry } from "./token-registry";

export type ColorScheme = "light" | "dark";

/** 与 `design-tokens.generated.css` / `globals.css` @theme 对齐的语义槽位 */
export type SemanticCssVarSlot =
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "secondary-foreground"
  | "destructive"
  | "destructive-foreground"
  | "background"
  | "foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "accent-foreground"
  | "border"
  | "input"
  | "ring"
  | "card"
  | "card-foreground";

export function getTokenEntry(tokenId: string): DesignTokenEntry | undefined {
  return DESIGN_TOKENS.find((t) => t.id === tokenId);
}

export function resolveTokenValue(tokenId: string, scheme: ColorScheme): string | undefined {
  const row = getTokenEntry(tokenId);
  if (!row) return undefined;
  return scheme === "light" ? row.light : row.dark;
}

/** 可作为「主题色来源」的 token id（语义 + 图表 + 侧栏色板） */
export function themeSourceTokenIds(): string[] {
  return DESIGN_TOKENS.filter((t) => t.category === "semantic" || t.category === "chart" || t.category === "sidebar").map(
    (t) => t.id,
  );
}

/** 将槽位映射到「来源 tokenId」，解析为当前 JSON 下的 light/dark 字面量写入内联 CSS 变量 */
export function storySemanticCssVars(
  mapping: Partial<Record<SemanticCssVarSlot, string>>,
  scheme: ColorScheme,
): CSSProperties {
  const style: Record<string, string> = {};
  for (const [slot, sourceTokenId] of Object.entries(mapping)) {
    if (!sourceTokenId) continue;
    const v = resolveTokenValue(sourceTokenId, scheme);
    if (v === undefined) continue;
    style[`--${slot}`] = v;
  }
  return style as CSSProperties;
}

/** 与 Storybook Controls 字段一一对应（preview 级默认 args） */
export const storyThemeControlDefaults = {
  themePrimaryToken: "primary",
  themePrimaryFgToken: "primary-foreground",
  themeSecondaryToken: "secondary",
  themeSecondaryFgToken: "secondary-foreground",
  themeDestructiveToken: "destructive",
  themeDestructiveFgToken: "destructive-foreground",
  themeBackgroundToken: "background",
  themeForegroundToken: "foreground",
  themeMutedToken: "muted",
  themeMutedFgToken: "muted-foreground",
  themeAccentToken: "accent",
  themeAccentFgToken: "accent-foreground",
  themeBorderToken: "border",
  themeInputToken: "input",
  themeRingToken: "ring",
  themeCardToken: "card",
  themeCardFgToken: "card-foreground",
} as const;

export type StoryThemeControlArgs = typeof storyThemeControlDefaults;

export function storyThemeVarsFromControlArgs(
  args: Record<string, unknown>,
  scheme: ColorScheme,
): CSSProperties {
  const g = (k: keyof typeof storyThemeControlDefaults) =>
    (args[k] as string) ?? storyThemeControlDefaults[k];

  return storySemanticCssVars(
    {
      primary: g("themePrimaryToken"),
      "primary-foreground": g("themePrimaryFgToken"),
      secondary: g("themeSecondaryToken"),
      "secondary-foreground": g("themeSecondaryFgToken"),
      destructive: g("themeDestructiveToken"),
      "destructive-foreground": g("themeDestructiveFgToken"),
      background: g("themeBackgroundToken"),
      foreground: g("themeForegroundToken"),
      muted: g("themeMutedToken"),
      "muted-foreground": g("themeMutedFgToken"),
      accent: g("themeAccentToken"),
      "accent-foreground": g("themeAccentFgToken"),
      border: g("themeBorderToken"),
      input: g("themeInputToken"),
      ring: g("themeRingToken"),
      card: g("themeCardToken"),
      "card-foreground": g("themeCardFgToken"),
    },
    scheme,
  );
}
