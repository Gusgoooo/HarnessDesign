import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import badgeSrc from "./badge.tsx?raw";
import { Badge } from "./badge";

const audit = autoClassControls(badgeSrc);

const meta = {
  title: "Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["children", "variant"],
    }),
  },
  args: { children: "Badge", variant: "default", ...audit.args },
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "destructive", "outline"] },
    children: { control: "text" },
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
  render: (args) => (
    <Badge
      variant={args.variant}
      className={audit.buildClassName(args as unknown as Record<string, string>)}
    >
      {args.children}
    </Badge>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary", children: "次要" } };
export const Destructive: Story = { args: { variant: "destructive", children: "危险" } };
export const Outline: Story = { args: { variant: "outline", children: "线框" } };
