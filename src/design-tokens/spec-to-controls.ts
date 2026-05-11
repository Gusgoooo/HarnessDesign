/**
 * spec.json → Storybook Controls 桥接。
 * 从组件 spec 的 styleLock.blacklist 提取 hidePatterns / hidePrefixes，
 * 并导出 variant → token class 映射供 AI 使用。
 */

type SpecBlacklistEntry = {
  description: string;
  pattern: string;
};

type SpecOptionalProp = {
  name: string;
  description: string;
  type: string;
  required?: boolean;
  defaultValue?: unknown;
  enumMap?: Record<string, string[]>;
};

type ComponentSpec = {
  id: string;
  componentName: string;
  styleLock?: {
    baselineTokens?: string[];
    blacklist?: SpecBlacklistEntry[];
  };
  optionalProps?: SpecOptionalProp[];
};

export function specBlacklistPatterns(spec: ComponentSpec): RegExp[] {
  const entries = spec.styleLock?.blacklist ?? [];
  return entries.map((e) => new RegExp(e.pattern));
}

export function specHidePrefixes(spec: ComponentSpec): string[] {
  const patterns = spec.styleLock?.blacklist ?? [];
  const prefixes: string[] = [];
  for (const entry of patterns) {
    const m = entry.pattern.match(/^\^?\(?([\w|-]+)\)?-/);
    if (m) {
      const alts = m[1].split("|");
      prefixes.push(...alts);
    }
  }
  return [...new Set(prefixes)];
}

export function getSpecVariantTokenMap(
  spec: ComponentSpec,
): Record<string, Record<string, string[]>> {
  const result: Record<string, Record<string, string[]>> = {};
  for (const prop of spec.optionalProps ?? []) {
    if (!prop.enumMap) continue;
    result[prop.name] = prop.enumMap;
  }
  return result;
}
