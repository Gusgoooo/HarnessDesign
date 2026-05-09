import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { TRIGGER_VARIANTS, TRIGGER_SIZES } from "@/design-tokens/story-controls";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import dropdownSrc from "./dropdown-menu.tsx?raw";
import { buttonVariants } from "./button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "./dropdown-menu";

const audit = autoClassControls(dropdownSrc);

type DropdownStoryArgs = {
  triggerVariant: string;
  triggerSize: string;
};

const meta = {
  title: "DropdownMenu",
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
    const args = _args as unknown as DropdownStoryArgs & Record<string, string>;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({
            variant: args.triggerVariant as any,
            size: args.triggerSize as any,
          })}
        >
          菜单 ▾
        </DropdownMenuTrigger>
        <DropdownMenuContent className={audit.buildClassName(args)}>
          <DropdownMenuItem>复制</DropdownMenuItem>
          <DropdownMenuItem>重命名</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>删除</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};
