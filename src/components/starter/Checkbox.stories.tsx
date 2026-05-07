import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta = {
  title: "Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    disabled: false,
    defaultChecked: false,
  },
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    className: { control: "text" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="cb-demo" {...args} />
      <Label htmlFor="cb-demo">同意条款</Label>
    </div>
  ),
};

export const Checked: Story = {
  args: { defaultChecked: true },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="cb-checked" {...args} />
      <Label htmlFor="cb-checked">已选中</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="cb-disabled" {...args} />
      <Label htmlFor="cb-disabled">不可用</Label>
    </div>
  ),
};
