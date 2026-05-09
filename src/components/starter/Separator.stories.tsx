import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import separatorSrc from "./separator.tsx?raw";
import { Separator } from "./separator";

const audit = autoClassControls(separatorSrc);

const meta = {
  title: "Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["orientation"],
    }),
  },
  args: { orientation: "horizontal" as const, ...audit.args },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="flex w-full flex-col gap-sm">
      <p className="text-sm">区块 A</p>
      <Separator orientation={args.orientation} className={audit.buildClassName(args as unknown as Record<string, string>)} />
      <p className="text-sm">区块 B</p>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-16 items-center gap-sm">
      <span className="text-sm">左</span>
      <Separator orientation={args.orientation} decorative className={audit.buildClassName(args as unknown as Record<string, string>)} />
      <span className="text-sm">右</span>
    </div>
  ),
};
