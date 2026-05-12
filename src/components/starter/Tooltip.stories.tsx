import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./tooltip.tsx?raw";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";
import { Button } from "./button";

const audit = autoClassControls(componentSrc);

const meta = {
  title: "基础组件库/Tooltip",
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({ ignoreArgNames: ["children"] }),
  },
  args: { ...audit.args },
  argTypes: {
    className: { table: { disable: true } },
    children: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">悬停查看提示</Button>
          </TooltipTrigger>
          <TooltipContent className={spreadAutoPreviewProps(audit, args as ClassOverrideArgs).className}>
            <p>这是提示信息</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
};
