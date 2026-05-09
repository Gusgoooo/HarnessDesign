import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { TRIGGER_VARIANTS, TRIGGER_SIZES } from "@/design-tokens/story-controls";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import tooltipSrc from "./tooltip.tsx?raw";
import { buttonVariants } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const audit = autoClassControls(tooltipSrc);

type TooltipStoryArgs = {
  triggerVariant: string;
  triggerSize: string;
};

const meta = {
  title: "Tooltip",
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({}),
  },
  args: {
    triggerVariant: "outline",
    triggerSize: "default",
    ...audit.args,
  },
  argTypes: {
    className: { table: { disable: true } },
    triggerVariant: {
      control: "select",
      options: [...TRIGGER_VARIANTS],
      description: "触发按钮变体",
    },
    triggerSize: {
      control: "select",
      options: [...TRIGGER_SIZES],
      description: "触发按钮尺寸",
    },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_args) => {
    const args = _args as unknown as TooltipStoryArgs & Record<string, string>;
    return (
      <Tooltip>
        <TooltipTrigger
          className={buttonVariants({
            variant: args.triggerVariant as any,
            size: args.triggerSize as any,
          })}
        >
          悬停查看
        </TooltipTrigger>
        <TooltipContent className={audit.buildClassName(args)}>简短说明文案</TooltipContent>
      </Tooltip>
    );
  },
};
