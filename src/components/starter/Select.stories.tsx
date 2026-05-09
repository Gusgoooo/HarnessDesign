import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import selectSrc from "./select.tsx?raw";
import { Label } from "./label";
import { Select } from "./select";

const audit = autoClassControls(selectSrc);

const meta = {
  title: "Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["id", "defaultValue", "children"],
    }),
  },
  args: { ...audit.args },
  argTypes: {
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Native: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-sm">
      <Label htmlFor="sel">选项</Label>
      <Select
        id="sel"
        defaultValue="b"
        className={audit.buildClassName(args as unknown as Record<string, string>)}
      >
        <option value="a">选项 A</option>
        <option value="b">选项 B</option>
        <option value="c">选项 C</option>
      </Select>
    </div>
  ),
};
