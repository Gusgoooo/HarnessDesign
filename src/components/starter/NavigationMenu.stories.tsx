import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./navigation-menu.tsx?raw";
import * as Comp from "./navigation-menu";

const audit = autoClassControls(componentSrc);

type Args = { [k: string]: string };

/** Storybook 依赖 URL；演示用锚点会改写 hash，破坏路由并易被误认为「全屏/丢界面」 */
function preventStoryNav(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
}

const meta = {
  title: "基础组件库/NavigationMenu",
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
      <Comp.NavigationMenu className={prev.className}>
        <Comp.NavigationMenuList className={slot[0]}>
          <Comp.NavigationMenuItem>
            <Comp.NavigationMenuLink href="#" onClick={preventStoryNav} className={slot[3]}>
              首页
            </Comp.NavigationMenuLink>
          </Comp.NavigationMenuItem>
          <Comp.NavigationMenuItem>
            <Comp.NavigationMenuLink href="#" onClick={preventStoryNav} className={slot[3]}>
              关于
            </Comp.NavigationMenuLink>
          </Comp.NavigationMenuItem>
        </Comp.NavigationMenuList>
      </Comp.NavigationMenu>
    );
  },
};
