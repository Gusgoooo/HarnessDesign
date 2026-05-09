import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import checkboxSrc from "./checkbox.tsx?raw";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const audit = autoClassControls(checkboxSrc);

const meta = {
  title: "Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["disabled", "defaultChecked"],
    }),
  },
  args: { disabled: false, defaultChecked: false, ...audit.args },
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-xs">
      <Checkbox id="cb-demo" disabled={args.disabled} defaultChecked={args.defaultChecked} className={audit.buildClassName(args as unknown as Record<string, string>)} />
      <Label htmlFor="cb-demo">同意条款</Label>
    </div>
  ),
};

export const Checked: Story = {
  args: { defaultChecked: true },
  render: (args) => (
    <div className="flex items-center gap-xs">
      <Checkbox id="cb-checked" disabled={args.disabled} defaultChecked={args.defaultChecked} className={audit.buildClassName(args as unknown as Record<string, string>)} />
      <Label htmlFor="cb-checked">已选中</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex items-center gap-xs">
      <Checkbox id="cb-disabled" disabled={args.disabled} defaultChecked={args.defaultChecked} className={audit.buildClassName(args as unknown as Record<string, string>)} />
      <Label htmlFor="cb-disabled">不可用</Label>
    </div>
  ),
};
