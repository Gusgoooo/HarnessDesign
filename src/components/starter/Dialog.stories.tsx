import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import dialogSrc from "./dialog.tsx?raw";
import { Button } from "./button";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "./dialog";

const audit = autoClassControls(dialogSrc);

type DialogStoryArgs = {
  defaultOpen: boolean;
  [k: string]: unknown;
};

const meta = {
  title: "基础组件库/Dialog",
  parameters: {
    layout: "fullscreen",
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["defaultOpen"],
    }),
  },
  args: {
    defaultOpen: false,
    ...audit.args,
  },
  argTypes: {
    defaultOpen: { control: "boolean", description: "初始打开状态" },
    ...audit.argTypes,
  },
} satisfies Meta<DialogStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_a) => {
    const args = _a as unknown as DialogStoryArgs & Record<string, string>;
    const prev = spreadAutoPreviewProps(audit, args as ClassOverrideArgs);
    const slot = prev.previewCnSlotOverrides ?? [];
    return (
      <Dialog defaultOpen={args.defaultOpen}>
        <div className="flex min-h-screen items-center justify-center">
          <DialogTrigger asChild>
            <Button variant="outline">打开对话框</Button>
          </DialogTrigger>
        </div>
        <DialogContent className={prev.className}>
          <DialogHeader className={slot[1]}>
            <DialogTitle className={slot[3]}>对话框标题</DialogTitle>
            <DialogDescription className={slot[4]}>这是一段描述文本。点击遮罩或按 Esc 关闭。</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm">对话框内容区域</div>
          <DialogFooter className={slot[2]}>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button type="button">确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};
