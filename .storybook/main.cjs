const path = require("node:path");

const repoRoot = path.join(__dirname, "..");

/** @type {import('@storybook/react-vite').StorybookConfig} */
module.exports = {
  /** 仅收录业务/组件与文档 MDX，不包含 harness 目录 */
  stories: ["../src/**/*.mdx", "../src/components/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  /**
   * 默认 `react-docgen` 对 TS forwardRef / 组合组件 props 提取不完整 → Controls 为空。
   * 使用 TypeScript 版 docgen 才能稳定生成 Controls（性能略慢可接受）。
   */
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  docs: {
    autodocs: "tag",
  },
  core: {
    disableWhatsNewNotifications: true,
  },
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite");
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    const { schemaApiPlugin } = await import(path.join(repoRoot, "vite-plugin-schema-api.mjs"));
    return mergeConfig(viteConfig, {
      plugins: [tailwindcss(), schemaApiPlugin(repoRoot)],
      resolve: {
        alias: {
          "@": path.join(repoRoot, "src"),
        },
      },
      server: {
        fs: {
          allow: [repoRoot],
        },
      },
    });
  },
};
