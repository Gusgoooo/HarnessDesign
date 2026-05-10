import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import componentSrc from "./empty.tsx?raw";
import * as Comp from "./empty";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "Empty",
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
      <Comp.Empty className={audit.buildClassName(args)}>
        <Comp.EmptyMedia />
        <Comp.EmptyHeader>
          <Comp.EmptyTitle>暂无数据</Comp.EmptyTitle>
          <Comp.EmptyDescription>这里还没有内容。</Comp.EmptyDescription>
        </Comp.EmptyHeader>
      </Comp.Empty>
    );
  },
};
