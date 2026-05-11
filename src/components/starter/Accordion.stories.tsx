import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./accordion.tsx?raw";
import * as Comp from "./accordion";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "Accordion",
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
      <Comp.Accordion type="single" collapsible>
        <Comp.AccordionItem value="item-1" className={prev.className}>
          <Comp.AccordionTrigger className={slot[0]}>第一项</Comp.AccordionTrigger>
          <Comp.AccordionContent className={slot[1]}>这是第一项的内容。</Comp.AccordionContent>
        </Comp.AccordionItem>
        <Comp.AccordionItem value="item-2" className={prev.className}>
          <Comp.AccordionTrigger className={slot[0]}>第二项</Comp.AccordionTrigger>
          <Comp.AccordionContent className={slot[1]}>这是第二项的内容。</Comp.AccordionContent>
        </Comp.AccordionItem>
        <Comp.AccordionItem value="item-3" className={prev.className}>
          <Comp.AccordionTrigger className={slot[0]}>第三项</Comp.AccordionTrigger>
          <Comp.AccordionContent className={slot[1]}>这是第三项的内容。</Comp.AccordionContent>
        </Comp.AccordionItem>
      </Comp.Accordion>
    );
  },
};
