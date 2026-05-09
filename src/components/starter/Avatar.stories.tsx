import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import avatarSrc from "./avatar.tsx?raw";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const audit = autoClassControls(avatarSrc);

const meta = {
  title: "Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({}),
  },
  args: { ...audit.args },
  argTypes: {
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  render: (args) => (
    <Avatar className={audit.buildClassName(args as unknown as Record<string, string>)}>
      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="头像" />
      <AvatarFallback>FX</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackOnly: Story = {
  render: (args) => (
    <Avatar className={audit.buildClassName(args as unknown as Record<string, string>)}>
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
  ),
};
