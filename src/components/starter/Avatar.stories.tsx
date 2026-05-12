import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./avatar.tsx?raw";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

const audit = autoClassControls(componentSrc);

const meta = {
  title: "基础组件库/Avatar",
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
    const slot = prev.previewCnSlotOverrides ?? [];
    return (
      <Avatar className={prev.className}>
        <AvatarImage src="https://github.com/shadcn.png" alt="头像" className={slot[0]} />
        <AvatarFallback className={slot[1]}>CN</AvatarFallback>
      </Avatar>
    );
  },
};
