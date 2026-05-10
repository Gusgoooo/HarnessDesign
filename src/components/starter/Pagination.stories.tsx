import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import componentSrc from "./pagination.tsx?raw";
import * as Comp from "./pagination";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "Pagination",
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
      <Comp.Pagination className={audit.buildClassName(args)}>
        <Comp.PaginationContent>
          <Comp.PaginationItem><Comp.PaginationPrevious href="#" /></Comp.PaginationItem>
          <Comp.PaginationItem><Comp.PaginationLink href="#">1</Comp.PaginationLink></Comp.PaginationItem>
          <Comp.PaginationItem><Comp.PaginationLink href="#" isActive>2</Comp.PaginationLink></Comp.PaginationItem>
          <Comp.PaginationItem><Comp.PaginationLink href="#">3</Comp.PaginationLink></Comp.PaginationItem>
          <Comp.PaginationItem><Comp.PaginationEllipsis /></Comp.PaginationItem>
          <Comp.PaginationItem><Comp.PaginationNext href="#" /></Comp.PaginationItem>
        </Comp.PaginationContent>
      </Comp.Pagination>
    );
  },
};
