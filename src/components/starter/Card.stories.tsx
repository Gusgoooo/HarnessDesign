import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import {
  TEXT_SIZE_MAP, TEXT_SIZE_LABEL, TONE_MAP, TONE_LABEL,
  SPACING_MAP, SPACING_LABEL, BG_MAP, BG_LABEL,
  SHADOW_MAP, SHADOW_LABEL, BORDER_STYLE_MAP, BORDER_STYLE_LABEL,
  labeledSelect,
} from "@/design-tokens/story-controls";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import cardSrc from "./card.tsx?raw";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const audit = autoClassControls(cardSrc);

type CardStoryArgs = Record<string, string> & {
  headerPadding: string;
  contentPadding: string;
  contentTextSize: string;
  contentTone: string;
  footerPadding: string;
  footerGap: string;
  footerBg: string;
  footerBorder: string;
  footerShadow: string;
};

const meta = {
  title: "Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({}),
  },
  args: {
    headerPadding: "lg",
    contentPadding: "lg",
    contentTextSize: "sm",
    contentTone: "muted",
    footerPadding: "lg",
    footerGap: "sm",
    footerBg: "transparent",
    footerBorder: "none",
    footerShadow: "none",
    ...audit.args,
  },
  argTypes: {
    className: { table: { disable: true } },
    headerPadding: labeledSelect(SPACING_MAP, SPACING_LABEL, "头部内边距", "头部"),
    contentPadding: labeledSelect(SPACING_MAP, SPACING_LABEL, "内容区内边距", "内容"),
    contentTextSize: labeledSelect(TEXT_SIZE_MAP, TEXT_SIZE_LABEL, "正文字号", "内容"),
    contentTone: labeledSelect(TONE_MAP, TONE_LABEL, "正文色调", "内容"),
    footerPadding: labeledSelect(SPACING_MAP, SPACING_LABEL, "页脚内边距", "页脚"),
    footerGap: labeledSelect(SPACING_MAP, SPACING_LABEL, "页脚按钮间距", "页脚"),
    footerBg: labeledSelect(BG_MAP, BG_LABEL, "页脚背景", "页脚"),
    footerBorder: labeledSelect(BORDER_STYLE_MAP, BORDER_STYLE_LABEL, "页脚边框", "页脚"),
    footerShadow: labeledSelect(SHADOW_MAP, SHADOW_LABEL, "页脚阴影", "页脚"),
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_args) => {
    const args = _args as unknown as CardStoryArgs;
    const hp = SPACING_MAP[args.headerPadding];
    const cp = SPACING_MAP[args.contentPadding];
    const fp = SPACING_MAP[args.footerPadding];
    const fg = SPACING_MAP[args.footerGap];
    return (
      <Card className={cn("w-full", audit.buildClassName(args))}>
        <CardHeader className={`p-${hp}`}>
          <CardTitle>卡片标题</CardTitle>
          <CardDescription>用于分组展示内容与操作区。</CardDescription>
        </CardHeader>
        <CardContent className={`p-${cp} pt-0`}>
          <p className={`${TEXT_SIZE_MAP[args.contentTextSize]} ${TONE_MAP[args.contentTone]}`}>
            正文区域。
          </p>
        </CardContent>
        <CardFooter className={`flex flex-row p-${fp} pt-0 gap-${fg} ${BG_MAP[args.footerBg]} ${BORDER_STYLE_MAP[args.footerBorder]} ${SHADOW_MAP[args.footerShadow]}`}>
          <Button size="sm">确认</Button>
          <Button size="sm" variant="outline">取消</Button>
        </CardFooter>
      </Card>
    );
  },
};
