import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./switch.tsx?raw";
import { Switch } from "./switch";
import { Label } from "./label";

/** Switch 轨道/拇指宽高、药丸圆角与拇指阴影由实现锁定，不在 Controls 里映射 spacing / radius / shadow */
const audit = autoClassControls(componentSrc, {
  hidePrefixes: ["w", "h", "rounded", "shadow"],
});

type SwitchArgs = {
  checked: boolean;
  disabled: boolean;
};

const meta = {
  title: "Switch",
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({ ignoreArgNames: ["children", "id"] }),
  },
  args: {
    checked: false,
    disabled: false,
    ...audit.args,
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "受控演示：是否打开",
    },
    disabled: {
      control: "boolean",
      description: "禁用态",
    },
    className: { table: { disable: true } },
    children: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta<SwitchArgs & Record<string, unknown>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const { checked, disabled, ...rest } = args as SwitchArgs & Record<string, unknown>;
    const [on, setOn] = React.useState(checked);
    React.useEffect(() => {
      setOn(checked);
    }, [checked]);
    return (
      <div className="flex items-center gap-2">
        <Switch
          id="airplane"
          checked={on}
          onCheckedChange={setOn}
          disabled={disabled}
          className={spreadAutoPreviewProps(audit, rest as ClassOverrideArgs).className}
        />
        <Label htmlFor="airplane">飞行模式</Label>
      </div>
    );
  },
};
