import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./tabs.tsx?raw";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

const audit = autoClassControls(componentSrc);

const meta = {
  title: "基础组件库/Tabs",
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({ ignoreArgNames: ["children", "defaultValue", "value", "onValueChange"] }),
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
    const slot = prev.previewCnSlotOverrides ?? [];
    return (
      <div className="w-[400px]">
        <Tabs defaultValue="account" className={prev.className}>
          <TabsList className={slot[0]}>
            <TabsTrigger value="account" className={slot[1]}>账户</TabsTrigger>
            <TabsTrigger value="password" className={slot[1]}>密码</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className={slot[2]}>
            <p className="text-sm text-muted-foreground">在这里管理您的账户设置。</p>
          </TabsContent>
          <TabsContent value="password" className={slot[2]}>
            <p className="text-sm text-muted-foreground">在这里修改您的密码。</p>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};
