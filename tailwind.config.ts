import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import { harnessSafelist, harnessTailwindExtend } from "./tailwind.harness.generated";

const extend: Record<string, Record<string, string>> = {};
if (Object.keys(harnessTailwindExtend.spacing).length) {
  extend.spacing = { ...harnessTailwindExtend.spacing };
}
if (Object.keys(harnessTailwindExtend.colors).length) {
  extend.colors = { ...harnessTailwindExtend.colors };
}
if (Object.keys(harnessTailwindExtend.borderRadius).length) {
  extend.borderRadius = { ...harnessTailwindExtend.borderRadius };
}

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/design-portal/**/*.{html,ts,tsx}",
    "./src/harness/schema/**/*.json",
    "./.storybook/**/*.{ts,tsx}",
  ],
  safelist: harnessSafelist,
  theme: {
    extend,
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
