import tokensDoc from "./tokens.json";

export type DesignTokenCategory =
  | "semantic"
  | "radius"
  | "radius-scale"
  | "chart"
  | "sidebar"
  | "spacing"
  | "layout"
  | "elevation"
  | "motion"
  | "z-index"
  | "typography"
  | "opacity"
  | "border"
  | string;

export interface DesignTokenEntry {
  id: string;
  category: DesignTokenCategory;
  light: string;
  dark: string;
  /** 推荐在组件中使用的 Tailwind 语义类或说明 */
  tailwindClass: string;
  /** 试点映射：哪些业务封装组件应使用该 token */
  usedBy: ("DataTable" | "Button")[];
  /** 为 false 时不写入 design-tokens.generated.css（仅 Story 绑定 / 文档） */
  emitCss?: boolean;
}

type TokensFile = {
  version: number;
  description?: string;
  tokens: DesignTokenEntry[];
};

const doc = tokensDoc as TokensFile;

export const DESIGN_TOKENS: DesignTokenEntry[] = doc.tokens;

export function tokensByCategory(): Record<string, DesignTokenEntry[]> {
  const map: Record<string, DesignTokenEntry[]> = {};
  for (const t of DESIGN_TOKENS) {
    const k = t.category || "other";
    if (!map[k]) map[k] = [];
    map[k].push(t);
  }
  return map;
}
