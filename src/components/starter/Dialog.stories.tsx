import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { TRIGGER_VARIANTS, TRIGGER_SIZES } from "@/design-tokens/story-controls";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import dialogSrc from "./dialog.tsx?raw";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./button";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "./dialog";

const audit = autoClassControls(dialogSrc);

type DialogStoryArgs = {
  defaultOpen: boolean;
  triggerVariant: string;
  triggerSize: string;
  [k: string]: unknown;
};

const meta = {
  title: "Dialog",
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["defaultOpen"],
    }),
  },
  args: {
    defaultOpen: false,
    triggerVariant: "outline",
    triggerSize: "default",
    ...audit.args,
  },
  argTypes: {
    defaultOpen: { control: "boolean", description: "初始打开状态" },
    triggerVariant: {
      control: "select",
      options: [...TRIGGER_VARIANTS],
      description: "触发/关闭按钮变体",
    },
    triggerSize: {
      control: "select",
      options: [...TRIGGER_SIZES],
      description: "触发/关闭按钮尺寸",
    },
    ...audit.argTypes,
  },
} satisfies Meta<DialogStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (_a) => {
    const args = _a as unknown as DialogStoryArgs & Record<string, string>;
    const triggerCls = cn(
      buttonVariants({ variant: args.triggerVariant as any, size: args.triggerSize as any }),
    );
    return (
      <Dialog defaultOpen={args.defaultOpen}>
        <DialogTrigger className={triggerCls}>
          打开对话框
        </DialogTrigger>
        <DialogContent className={audit.buildClassName(args)}>
          <DialogHeader>
            <DialogTitle>确认操作</DialogTitle>
            <DialogDescription>此处可放置说明文案；点击遮罩或按 Esc 关闭。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className={triggerCls}>
              取消
            </DialogClose>
            <Button type="button">确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};
