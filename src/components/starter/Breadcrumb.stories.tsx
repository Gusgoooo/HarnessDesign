import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import componentSrc from "./breadcrumb.tsx?raw";
import * as Comp from "./breadcrumb";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const noop = (e: React.MouseEvent) => e.preventDefault();

const meta = {
  title: "Breadcrumb",
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
      <Comp.Breadcrumb>
        <Comp.BreadcrumbList className={audit.buildClassName(args)}>
          <Comp.BreadcrumbItem><Comp.BreadcrumbLink href="#" onClick={noop}>首页</Comp.BreadcrumbLink></Comp.BreadcrumbItem>
          <Comp.BreadcrumbSeparator />
          <Comp.BreadcrumbItem><Comp.BreadcrumbLink href="#" onClick={noop}>组件</Comp.BreadcrumbLink></Comp.BreadcrumbItem>
          <Comp.BreadcrumbSeparator />
          <Comp.BreadcrumbItem><Comp.BreadcrumbPage>面包屑</Comp.BreadcrumbPage></Comp.BreadcrumbItem>
        </Comp.BreadcrumbList>
      </Comp.Breadcrumb>
    );
  },
};
