import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { TEXT_SIZE_MAP, TEXT_SIZE_LABEL, TONE_MAP, TONE_LABEL, labeledSelect } from "@/design-tokens/story-controls";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import progressSrc from "./progress.tsx?raw";
import { Progress } from "./progress";

const audit = autoClassControls(progressSrc);

const meta = {
  title: "Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["value", "max"],
    }),
  },
  args: { value: 45, max: 100, ...audit.args },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    max: { control: "number" },
    className: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-full">
      <Progress
        value={args.value}
        max={args.max}
        className={audit.buildClassName(args as unknown as Record<string, string>)}
      />
    </div>
  ),
};

type AnimatedArgs = { labelTextSize: string; labelTone: string };

function ProgressAnimatedDemo(props: AnimatedArgs & { auditClassName: string }) {
  const [v, setV] = React.useState(10);
  React.useEffect(() => {
    const t = window.setInterval(() => setV((x) => (x >= 100 ? 10 : x + 5)), 400);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="flex w-full flex-col gap-sm">
      <Progress value={v} className={props.auditClassName} />
      <p className={`${TEXT_SIZE_MAP[props.labelTextSize]} ${TONE_MAP[props.labelTone]}`}>{v}%</p>
    </div>
  );
}

export const AnimatedDemo: Story = {
  args: { labelTextSize: "xs", labelTone: "muted" } as unknown as typeof meta["args"],
  argTypes: {
    labelTextSize: labeledSelect(TEXT_SIZE_MAP, TEXT_SIZE_LABEL, "百分比标签字号"),
    labelTone: labeledSelect(TONE_MAP, TONE_LABEL, "百分比标签色调"),
  } as unknown as typeof meta["argTypes"],
  render: (_args) => {
    const args = _args as unknown as AnimatedArgs & Record<string, string>;
    return (
      <ProgressAnimatedDemo
        labelTextSize={args.labelTextSize}
        labelTone={args.labelTone}
        auditClassName={audit.buildClassName(args)}
      />
    );
  },
};
