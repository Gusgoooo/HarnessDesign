import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./empty.tsx?raw";
import * as Comp from "./empty";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "基础组件库/Empty",
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
    const prev = spreadAutoPreviewProps(audit, args as ClassOverrideArgs);
    const slot = prev.previewCnSlotOverrides ?? [];
    return (
      <Comp.Empty className={prev.className}>
        <Comp.EmptyMedia className={slot[1]} />
        <Comp.EmptyHeader className={slot[0]}>
          <Comp.EmptyTitle className={slot[2]}>暂无数据</Comp.EmptyTitle>
          <Comp.EmptyDescription className={slot[3]}>这里还没有内容。</Comp.EmptyDescription>
        </Comp.EmptyHeader>
      </Comp.Empty>
    );
  },
};
