import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import componentSrc from "./input-otp.tsx?raw";
import * as Comp from "./input-otp";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "InputOtp",
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({}),
  },
  args: { ...audit.args },
  argTypes: { ...audit.argTypes } as Meta<Args>["argTypes"],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <Comp.InputOTP maxLength={6} className={audit.buildClassName(args)}>
        <Comp.InputOTPGroup>
          <Comp.InputOTPSlot index={0} />
          <Comp.InputOTPSlot index={1} />
          <Comp.InputOTPSlot index={2} />
        </Comp.InputOTPGroup>
        <Comp.InputOTPSeparator />
        <Comp.InputOTPGroup>
          <Comp.InputOTPSlot index={3} />
          <Comp.InputOTPSlot index={4} />
          <Comp.InputOTPSlot index={5} />
        </Comp.InputOTPGroup>
      </Comp.InputOTP>
    );
  },
};
