import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./resizable.tsx?raw";
import * as Comp from "./resizable";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "基础组件库/Resizable",
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
    const prev = spreadAutoPreviewProps(audit, args as ClassOverrideArgs);
    const slot = prev.previewCnSlotOverrides ?? [];
    return (
      <Comp.ResizablePanelGroup orientation="horizontal" className={"min-h-[200px] max-w-md rounded-lg border " + (prev.className ?? "")}>
        <Comp.ResizablePanel defaultSize={50}><div className="flex h-full items-center justify-center p-6"><span className="font-semibold">左侧</span></div></Comp.ResizablePanel>
        <Comp.ResizableHandle className={slot[0]} />
        <Comp.ResizablePanel defaultSize={50}><div className="flex h-full items-center justify-center p-6"><span className="font-semibold">右侧</span></div></Comp.ResizablePanel>
      </Comp.ResizablePanelGroup>
    );
  },
};
