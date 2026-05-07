import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta = {
  title: "Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>卡片标题</CardTitle>
        <CardDescription>用于分组展示内容与操作区。</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">正文区域。</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">确认</Button>
        <Button size="sm" variant="outline">
          取消
        </Button>
      </CardFooter>
    </Card>
  ),
};
