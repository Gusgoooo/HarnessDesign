import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import componentSrc from "./toggle-group.tsx?raw";
import * as Comp from "./toggle-group";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "ToggleGroup",
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({}),
  },
  args: { ...audit.args },
  argTypes: { ...audit.argTypes } as Meta<Args>["argTypes"],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <Comp.ToggleGroup type="single" className={audit.buildClassName(args)}>
        <Comp.ToggleGroupItem value="bold" aria-label="加粗"><span className="text-sm font-bold">B</span></Comp.ToggleGroupItem>
        <Comp.ToggleGroupItem value="italic" aria-label="斜体"><span className="text-sm italic">I</span></Comp.ToggleGroupItem>
        <Comp.ToggleGroupItem value="underline" aria-label="下划线"><span className="text-sm underline">U</span></Comp.ToggleGroupItem>
      </Comp.ToggleGroup>
    );
  },
};
