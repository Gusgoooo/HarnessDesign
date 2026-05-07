import { twMerge } from "tailwind-merge";

import type { ComponentSpec } from "@/harness/schema/types";
import { stripLockedClasses } from "@/harness/schema/style-merge";

/**
 * 「Business 封装范式」的通用合并：**baselineTokens** + 语义类名 + 经 **styleLock.blacklist** 剥离后的 consumer `className`。
 * 新增 BusinessButton / BusinessInput 时，在组件内对根节点调用本函数即可复用与 DataTable 同一套治理模型。
 *
 * @param userClassName 业务侧传入的 className（可能含 AI 乱写的间距等）
 * @param spec 当前组件对应的 ComponentSpec
 * @param semanticTokens 由 props 映射出的内部 Tailwind（如 density、variant），在 strip 之后、与 baseline 一起 twMerge
 */
export function mergeWithBusinessSpec(
  userClassName: string | undefined,
  spec: ComponentSpec,
  semanticTokens?: string | string[] | undefined,
): string {
  const safe = stripLockedClasses(userClassName, spec.styleLock);
  const base = spec.styleLock.baselineTokens.join(" ");
  const semantic = Array.isArray(semanticTokens) ? semanticTokens.filter(Boolean).join(" ") : (semanticTokens ?? "");
  return twMerge(base, semantic, safe);
}
