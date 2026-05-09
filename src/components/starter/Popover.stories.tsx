import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { TRIGGER_VARIANTS, TRIGGER_SIZES } from "@/design-tokens/story-controls";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import popoverSrc from "./popover.tsx?raw";
import { buttonVariants } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const audit = autoClassControls(popoverSrc);

type PopoverStoryArgs = {
  triggerVariant: string;
  triggerSize: string;
};

const meta = {
  title: "Popover",
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
    const args = _args as unknown as PopoverStoryArgs & Record<string, string>;
    return (
      <Popover>
        <PopoverTrigger
          className={buttonVariants({
            variant: args.triggerVariant as any,
            size: args.triggerSize as any,
          })}
        >
          打开 Popover
        </PopoverTrigger>
        <PopoverContent className={audit.buildClassName(args)}>
          <p className="text-sm text-muted-foreground">
            可放置过滤器、附加表单等。
          </p>
        </PopoverContent>
      </Popover>
    );
  },
};
