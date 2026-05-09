import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import buttonSrc from "./button.tsx?raw";
import { Button } from "./button";

const audit = autoClassControls(buttonSrc);

const meta = {
  title: "Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["children", "variant", "size", "type", "disabled"],
    }),
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    disabled: false,
    type: "button",
    ...audit.args,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "视觉变体；颜色来自全局语义 token。",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "高度与内边距由 control-height、padding 等 token 驱动。",
    },
    disabled: { control: "boolean" },
    type: { control: "select", options: ["button", "submit", "reset"] },
    children: { control: "text" },
    asChild: { table: { disable: true } },
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
  render: (args) => (
    <Button
      variant={args.variant}
      size={args.size}
      disabled={args.disabled}
      type={args.type}
      className={audit.buildClassName(args as unknown as Record<string, string>)}
    >
      {args.children}
    </Button>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Link: Story = { args: { variant: "link" } };
export const Small: Story = { args: { size: "sm", children: "Small" } };
export const Large: Story = { args: { size: "lg", children: "Large" } };
