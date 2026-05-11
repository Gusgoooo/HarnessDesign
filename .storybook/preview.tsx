import type { Decorator, Preview } from "@storybook/react";
import { useEffect, useState, type ComponentProps } from "react";
import { DocsContainer } from "@storybook/blocks";
import { themes } from "@storybook/theming";
import "../src/styles/globals.css";

const DARK_KEY = "harness-dark-mode";
const PREVIEW_BG_LIGHT = "#ffffff";
const PREVIEW_BG_DARK = "#1c1c1e";

function useDarkSync() {
  const [dark, setDark] = useState(
    () => typeof localStorage !== "undefined" && localStorage.getItem(DARK_KEY) === "true",
  );
  useEffect(() => {
    function apply() {
      const v = localStorage.getItem(DARK_KEY) === "true";
      setDark(v);
      document.documentElement.classList.toggle("dark", v);
      document.body.style.background = v ? PREVIEW_BG_DARK : PREVIEW_BG_LIGHT;
    }
    apply();
    window.addEventListener("storage", apply);
    const ch = new BroadcastChannel(DARK_KEY);
    ch.onmessage = () => apply();
    return () => {
      window.removeEventListener("storage", apply);
      ch.close();
    };
  }, []);
  return dark;
}

const DarkModeDecorator: Decorator = (Story, context) => {
  useDarkSync();
  const fullscreen = context.parameters.layout === "fullscreen";
  if (fullscreen) {
    return (
      <div className="fixed inset-0 box-border flex min-h-0 min-w-[320px] flex-col overflow-hidden">
        <Story />
      </div>
    );
  }
  return (
    <div style={{ minHeight: "100%", minWidth: 320 }}>
      <Story />
    </div>
  );
};

type DocsContainerProps = ComponentProps<typeof DocsContainer>;

function ThemedDocsContainer(props: DocsContainerProps) {
  const dark = useDarkSync();
  return <DocsContainer {...props} theme={dark ? themes.dark : themes.light} />;
}

const preview: Preview = {
  decorators: [DarkModeDecorator],
  parameters: {
    options: {
      storySort: {
        order: [
          "ALL",
          "DesignToken",
          "Patterns",
          "Badge",
          "Button",
          "Card",
          "Checkbox",
          "DataTable",
          "Input",
          ["*"],
        ],
      },
    },
    controls: {
      expanded: true,
      sort: "alpha",
    },
    backgrounds: { disable: true },
    layout: "centered",
    docs: {
      /** 隐藏所有 CSF 组件的 Docs 标签与文档页；仅 MDX 显式 `docs.disable: false` 的条目保留 */
      disable: true,
      container: ThemedDocsContainer,
    },
  },
};

export default preview;
