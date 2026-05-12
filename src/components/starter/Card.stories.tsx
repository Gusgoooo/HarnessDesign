import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./card.tsx?raw";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";

const audit = autoClassControls(componentSrc);

const meta = {
  title: "基础组件库/Card",
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
  render: (args) => {
    const prev = spreadAutoPreviewProps(audit, args as ClassOverrideArgs);
    /** 与 `card.tsx` 中第 2～6 个 `className={cn(` 顺序一致（根 Card 用 `prev.className`） */
    const slot = prev.previewCnSlotOverrides ?? [];
    return (
      <div className="w-[360px]">
        <Card className={prev.className}>
          <CardHeader className={slot[0]}>
            <CardTitle className={slot[1]}>卡片标题</CardTitle>
            <CardDescription className={slot[2]}>卡片描述文本</CardDescription>
          </CardHeader>
          <CardContent className={slot[3]}>
            <p>这是卡片的主要内容区域。</p>
          </CardContent>
          <CardFooter className={slot[4]}>
            <p>页脚信息</p>
          </CardFooter>
        </Card>
      </div>
    );
  },
};
