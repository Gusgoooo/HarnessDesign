import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import inputSrc from "./input.tsx?raw";
import { Input } from "./input";
import { Label } from "./label";

const audit = autoClassControls(inputSrc);

type InputStoryArgs = {
  placeholder: string;
  type: string;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  defaultValue?: string;
  className?: string;
  [k: string]: unknown;
};

const meta = {
  title: "Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["placeholder", "defaultValue", "type", "disabled", "readOnly", "required"],
    }),
  },
  args: {
    placeholder: "请输入…",
    type: "text",
    disabled: false,
    readOnly: false,
    required: false,
    ...audit.args,
  },
  argTypes: {
    type: { control: "select", options: ["text", "password", "email", "search", "number", "tel", "url"] },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    defaultValue: { control: "text" },
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
  render: (_args) => {
    const args = _args as unknown as InputStoryArgs & Record<string, string>;
    return (
      <Input
        placeholder={args.placeholder}
        type={args.type}
        disabled={args.disabled}
        readOnly={args.readOnly}
        required={args.required}
        defaultValue={args.defaultValue}
        className={audit.buildClassName(args)}
      />
    );
  },
} satisfies Meta<InputStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Password: Story = { args: { type: "password", placeholder: "请输入密码…" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "不可编辑" } };

export const WithLabel: Story = {
  render: (_args) => {
    const args = _args as unknown as InputStoryArgs & Record<string, string>;
    return (
      <div className="grid w-full gap-xs">
        <Label htmlFor="demo-input">标签</Label>
        <Input
          id="demo-input"
          placeholder={args.placeholder}
          type={args.type}
          disabled={args.disabled}
          readOnly={args.readOnly}
          required={args.required}
          defaultValue={args.defaultValue}
          className={audit.buildClassName(args)}
        />
      </div>
    );
  },
};
