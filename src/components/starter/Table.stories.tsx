import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls } from "@/design-tokens/tw-class-audit";
import componentSrc from "./table.tsx?raw";
import * as Comp from "./table";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

const meta = {
  title: "Table",
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
      <Comp.Table className={audit.buildClassName(args)}>
        <Comp.TableHeader>
          <Comp.TableRow>
            <Comp.TableHead>名称</Comp.TableHead>
            <Comp.TableHead>状态</Comp.TableHead>
            <Comp.TableHead className="text-right">金额</Comp.TableHead>
          </Comp.TableRow>
        </Comp.TableHeader>
        <Comp.TableBody>
          <Comp.TableRow>
            <Comp.TableCell className="font-medium">订单 001</Comp.TableCell>
            <Comp.TableCell>已完成</Comp.TableCell>
            <Comp.TableCell className="text-right">¥250.00</Comp.TableCell>
          </Comp.TableRow>
          <Comp.TableRow>
            <Comp.TableCell className="font-medium">订单 002</Comp.TableCell>
            <Comp.TableCell>处理中</Comp.TableCell>
            <Comp.TableCell className="text-right">¥150.00</Comp.TableCell>
          </Comp.TableRow>
        </Comp.TableBody>
      </Comp.Table>
    );
  },
};
