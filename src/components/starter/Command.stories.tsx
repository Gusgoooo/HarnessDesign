import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./command.tsx?raw";
import * as Comp from "./command";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "Command",
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
      <Comp.Command className={"w-[350px] rounded-lg border shadow-md " + (prev.className ?? "")}>
        <Comp.CommandInput placeholder="输入搜索…" className={slot[0]} />
        <Comp.CommandList className={slot[1]}>
          <Comp.CommandEmpty>未找到结果</Comp.CommandEmpty>
          <Comp.CommandGroup heading="建议" className={slot[2]}>
            <Comp.CommandItem className={slot[4]}>日历</Comp.CommandItem>
            <Comp.CommandItem className={slot[4]}>搜索</Comp.CommandItem>
            <Comp.CommandItem className={slot[4]}>设置</Comp.CommandItem>
          </Comp.CommandGroup>
        </Comp.CommandList>
      </Comp.Command>
    );
  },
};
