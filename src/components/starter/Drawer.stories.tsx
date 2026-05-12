import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./drawer.tsx?raw";
import * as Comp from "./drawer";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "基础组件库/Drawer",
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
    const prev = spreadAutoPreviewProps(audit, args as ClassOverrideArgs);
    const slot = prev.previewCnSlotOverrides ?? [];
    return (
      <div className="flex min-h-screen items-center justify-center">
      <Comp.Drawer>
        <Comp.DrawerTrigger asChild><button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm">打开抽屉</button></Comp.DrawerTrigger>
        <Comp.DrawerContent className={slot[0]}>
          <Comp.DrawerHeader className={slot[1]}>
            <Comp.DrawerTitle className={slot[3]}>编辑内容</Comp.DrawerTitle>
            <Comp.DrawerDescription className={slot[4]}>修改后点击保存。</Comp.DrawerDescription>
          </Comp.DrawerHeader>
          <div className="p-4 text-sm">抽屉内容区域</div>
          <Comp.DrawerFooter className={slot[2]}>
            <Comp.DrawerClose asChild><button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm">关闭</button></Comp.DrawerClose>
          </Comp.DrawerFooter>
        </Comp.DrawerContent>
      </Comp.Drawer>
      </div>
    );
  },
};
