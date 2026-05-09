import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import textareaSrc from "./textarea.tsx?raw";
import { Label } from "./label";
import { Textarea } from "./textarea";

const audit = autoClassControls(textareaSrc);

const meta = {
  title: "Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["placeholder", "rows", "disabled"],
    }),
  },
  args: { placeholder: "多行内容…", rows: 4, disabled: false, ...audit.args },
  argTypes: {
    rows: { control: "number" },
    disabled: { control: "boolean" },
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
  render: (args) => (
    <Textarea
      placeholder={args.placeholder}
      rows={args.rows}
      disabled={args.disabled}
      className={audit.buildClassName(args as unknown as Record<string, string>)}
    />
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full gap-sm">
      <Label htmlFor="t">备注</Label>
      <Textarea
        id="t"
        placeholder={args.placeholder}
        rows={args.rows}
        disabled={args.disabled}
        className={audit.buildClassName(args as unknown as Record<string, string>)}
      />
    </div>
  ),
};
