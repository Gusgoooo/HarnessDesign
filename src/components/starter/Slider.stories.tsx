import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import sliderSrc from "./slider.tsx?raw";
import { Slider } from "./slider";

const audit = autoClassControls(sliderSrc);

const meta = {
  title: "Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["min", "max", "defaultValue"],
    }),
  },
  args: { min: 0, max: 100, defaultValue: 40, ...audit.args },
  argTypes: {
    defaultValue: { control: { type: "range", min: 0, max: 100 } },
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-full">
      <Slider
        min={args.min}
        max={args.max}
        defaultValue={typeof args.defaultValue === "number" ? args.defaultValue : 40}
        className={audit.buildClassName(args as unknown as Record<string, string>)}
      />
    </div>
  ),
};
