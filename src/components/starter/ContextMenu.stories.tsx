import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import componentSrc from "./context-menu.tsx?raw";
import * as Comp from "./context-menu";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "ContextMenu",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
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
      <div className="flex min-h-screen items-center justify-center">
      <Comp.ContextMenu>
        <Comp.ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">右键点击此处</Comp.ContextMenuTrigger>
        <Comp.ContextMenuContent className={audit.buildClassName(args)}>
          <Comp.ContextMenuItem>返回</Comp.ContextMenuItem>
          <Comp.ContextMenuItem>前进</Comp.ContextMenuItem>
          <Comp.ContextMenuItem>刷新</Comp.ContextMenuItem>
          <Comp.ContextMenuSeparator />
          <Comp.ContextMenuItem>查看源代码</Comp.ContextMenuItem>
        </Comp.ContextMenuContent>
      </Comp.ContextMenu>
      </div>
    );
  },
};
