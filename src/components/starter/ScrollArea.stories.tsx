import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import {
  SPACING_MAP, SPACING_LABEL, RADIUS_MAP, RADIUS_LABEL,
  labeledSelect,
} from "@/design-tokens/story-controls";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import scrollSrc from "./scroll-area.tsx?raw";
import { ScrollArea } from "./scroll-area";

const audit = autoClassControls(scrollSrc);

type ScrollStoryArgs = {
  demoPadding: string;
  demoRadius: string;
  demoBorder: boolean;
};

const meta = {
  title: "ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({}),
  },
  args: {
    demoPadding: "sm",
    demoRadius: "md",
    demoBorder: true,
    ...audit.args,
  },
  argTypes: {
    className: { table: { disable: true } },
    demoPadding: { ...labeledSelect(SPACING_MAP, SPACING_LABEL, "容器内边距"), table: { category: "容器" } },
    demoRadius: { ...labeledSelect(RADIUS_MAP, RADIUS_LABEL, "容器圆角"), table: { category: "容器" } },
    demoBorder: {
      control: "boolean",
      description: "显示边框",
      table: { category: "容器" },
    },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_args) => {
    const args = _args as unknown as ScrollStoryArgs & Record<string, string>;
    const containerCls = [
      "min-h-48 max-w-md",
      RADIUS_MAP[args.demoRadius],
      args.demoBorder ? "border border-border" : "",
      `p-${SPACING_MAP[args.demoPadding]}`,
    ].join(" ");
    return (
      <ScrollArea className={containerCls}>
        {Array.from({ length: 24 }, (_, i) => (
          <p key={i} className="text-sm leading-relaxed">
            第 {i + 1} 行 — 滚动区域使用原生 overflow-auto，无额外依赖。
          </p>
        ))}
      </ScrollArea>
    );
  },
};
