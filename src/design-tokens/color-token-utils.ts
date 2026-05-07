/** 是否为可在 OKLCH 编辑器中编辑的 CSS 颜色字面量 */
export function isColorCssValue(s: string): boolean {
  const t = s.trim().toLowerCase();
  return (
    t.startsWith("oklch(") ||
    t.startsWith("#") ||
    t.startsWith("rgb(") ||
    t.startsWith("rgba(") ||
    t.startsWith("hsl(") ||
    t.startsWith("hsla(")
  );
}

export function isColorTokenRow(light: string, dark: string): boolean {
  return isColorCssValue(light) && isColorCssValue(dark);
}
