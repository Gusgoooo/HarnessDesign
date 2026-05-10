import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import componentSrc from "./item.tsx?raw";
import * as Comp from "./item";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "Item",
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
      <Comp.Item className={audit.buildClassName(args)}>
        <Comp.ItemContent>
          <Comp.ItemTitle>标题</Comp.ItemTitle>
          <Comp.ItemDescription>描述文本</Comp.ItemDescription>
        </Comp.ItemContent>
      </Comp.Item>
    );
  },
};
