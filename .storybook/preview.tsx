import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100%" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    options: {
      storySort: {
        order: [
          "DesignToken",
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
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "muted", value: "#f4f4f5" },
      ],
    },
    layout: "centered",
  },
};

export default preview;
