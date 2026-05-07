import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta = {
  title: "Button",
  component: Button,
  tags: ["autodocs"],
  decorators: [
    (Story, ctx) => {
      const r = ctx.args.borderRadius as number | undefined;
      return (
        <div style={r != null ? { "--radius": `${r}rem` } as React.CSSProperties : undefined}>
          <Story />
        </div>
      );
    },
  ],
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    disabled: false,
    type: "button",
    borderRadius: 0.625,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    disabled: { control: "boolean" },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
    },
    children: { control: "text" },
    borderRadius: {
      control: { type: "range", min: 0, max: 1.5, step: 0.0625 },
      description: "圆角大小 (rem)，映射 CSS 变量 --radius",
      table: { category: "样式" },
    },
    asChild: { table: { disable: true } },
    className: { control: "text" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Destructive: Story = {
  args: { variant: "destructive" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Link: Story = {
  args: { variant: "link" },
};

export const Small: Story = {
  args: { size: "sm", children: "Small" },
};

export const Large: Story = {
  args: { size: "lg", children: "Large" },
};
