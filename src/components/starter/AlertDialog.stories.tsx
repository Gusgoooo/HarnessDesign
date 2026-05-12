import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./alert-dialog.tsx?raw";
import * as Comp from "./alert-dialog";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "基础组件库/AlertDialog",
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
      <Comp.AlertDialog>
        <Comp.AlertDialogTrigger asChild><button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm">打开</button></Comp.AlertDialogTrigger>
        <Comp.AlertDialogContent className={slot[0]}>
          <Comp.AlertDialogHeader className={slot[1]}>
            <Comp.AlertDialogTitle className={slot[3]}>确认操作？</Comp.AlertDialogTitle>
            <Comp.AlertDialogDescription className={slot[4]}>此操作不可撤销。</Comp.AlertDialogDescription>
          </Comp.AlertDialogHeader>
          <Comp.AlertDialogFooter className={slot[2]}>
            <Comp.AlertDialogCancel className={slot[6]}>取消</Comp.AlertDialogCancel>
            <Comp.AlertDialogAction className={slot[5]}>继续</Comp.AlertDialogAction>
          </Comp.AlertDialogFooter>
        </Comp.AlertDialogContent>
      </Comp.AlertDialog>
      </div>
    );
  },
};
