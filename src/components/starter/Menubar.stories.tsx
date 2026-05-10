import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import componentSrc from "./menubar.tsx?raw";
import * as Comp from "./menubar";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "Menubar",
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
      <Comp.Menubar className={audit.buildClassName(args)}>
        <Comp.MenubarMenu>
          <Comp.MenubarTrigger>文件</Comp.MenubarTrigger>
          <Comp.MenubarContent>
            <Comp.MenubarItem>新建</Comp.MenubarItem>
            <Comp.MenubarItem>打开</Comp.MenubarItem>
            <Comp.MenubarSeparator />
            <Comp.MenubarItem>退出</Comp.MenubarItem>
          </Comp.MenubarContent>
        </Comp.MenubarMenu>
        <Comp.MenubarMenu>
          <Comp.MenubarTrigger>编辑</Comp.MenubarTrigger>
          <Comp.MenubarContent>
            <Comp.MenubarItem>撤销</Comp.MenubarItem>
            <Comp.MenubarItem>重做</Comp.MenubarItem>
          </Comp.MenubarContent>
        </Comp.MenubarMenu>
      </Comp.Menubar>
    );
  },
};
