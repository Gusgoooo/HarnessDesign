import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./dropdown-menu.tsx?raw";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./dropdown-menu";
import { Button } from "./button";

const audit = autoClassControls(componentSrc);

const meta = {
  title: "DropdownMenu",
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({ ignoreArgNames: ["children"] }),
  },
  args: { ...audit.args },
  argTypes: {
    className: { table: { disable: true } },
    children: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    bg_muted: "border"
  },

  render: (args) => {
    const prev = spreadAutoPreviewProps(audit, args as ClassOverrideArgs);
    const slot = prev.previewCnSlotOverrides ?? [];
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">打开菜单</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={slot[1]}>
          <DropdownMenuLabel className={slot[5]}>我的账户</DropdownMenuLabel>
          <DropdownMenuSeparator className={slot[6]} />
          <DropdownMenuItem className={slot[2]}>个人设置</DropdownMenuItem>
          <DropdownMenuItem className={slot[2]}>账单管理</DropdownMenuItem>
          <DropdownMenuItem className={slot[2]}>团队管理</DropdownMenuItem>
          <DropdownMenuItem className={slot[2]}>退出登录</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
};
