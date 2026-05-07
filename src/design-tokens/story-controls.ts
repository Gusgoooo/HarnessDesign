import tokensDoc from "./tokens.json";
import { DESIGN_TOKENS } from "./token-registry";

/** Story Controls 选项：tokenId 为 Controls 中的值，value 为映射到组件 prop 的字符串 */
export type StoryBindingRow = { tokenId: string; label?: string; value: string };

type TokensRoot = {
  tokens: unknown[];
  storyBindings?: Record<string, StoryBindingRow[]>;
};

const root = tokensDoc as unknown as TokensRoot;

export function storyBindingOptions(key: string): StoryBindingRow[] {
  return root.storyBindings?.[key] ?? [];
}

export function storyBindingTokenIds(key: string): string[] {
  return storyBindingOptions(key).map((o) => o.tokenId);
}

export function mapStoryBinding(key: string, tokenId: string | undefined, fallbackTokenId: string): string {
  const opts = storyBindingOptions(key);
  const fid = tokenId && opts.some((o) => o.tokenId === tokenId) ? tokenId : fallbackTokenId;
  return opts.find((o) => o.tokenId === fid)?.value ?? "";
}

export function mapBooleanFlag(tokenId: string | undefined, fallbackTokenId = "story-bool-false"): boolean {
  return mapStoryBinding("booleanFlag", tokenId, fallbackTokenId) === "true";
}

/** CSS 变量引用（token id 对应 tokens.json 中生成的 --id） */
export function cssVar(tokenId: string): string {
  return `var(--${tokenId})`;
}

/** 按分类列出可选 token id（供 argTypes.options） */
export function tokenIdsByCategory(category: string): string[] {
  return DESIGN_TOKENS.filter((t) => t.category === category).map((t) => t.id);
}

export function layoutMaxWidthTokenIds(): string[] {
  return tokenIdsByCategory("layout").filter((id) => id.startsWith("layout-max-w"));
}

export function layoutMinWidthTokenIds(): string[] {
  return tokenIdsByCategory("layout").filter((id) => id.startsWith("layout-min-w"));
}
