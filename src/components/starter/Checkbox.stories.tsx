import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./checkbox.tsx?raw";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const audit = autoClassControls(componentSrc);

const meta = {
  title: "基础组件库/Checkbox",
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({ ignoreArgNames: ["children", "id"] }),
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
      <div className="flex items-center gap-2">
        <Checkbox id="terms" className={spreadAutoPreviewProps(audit, args as ClassOverrideArgs).className} />
        <Label htmlFor="terms">同意条款</Label>
      </div>
    ),
};
