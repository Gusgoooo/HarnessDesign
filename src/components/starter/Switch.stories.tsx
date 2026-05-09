import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import switchSrc from "./switch.tsx?raw";
import { Label } from "./label";
import { Switch } from "./switch";

const audit = autoClassControls(switchSrc);

const meta = {
  title: "Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["disabled"],
    }),
  },
  args: { disabled: false, ...audit.args },
  argTypes: {
    disabled: { control: "boolean" },
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-xs">
      <Switch id="sw" disabled={args.disabled} className={audit.buildClassName(args as unknown as Record<string, string>)} />
      <Label htmlFor="sw">启用通知</Label>
    </div>
  ),
};
