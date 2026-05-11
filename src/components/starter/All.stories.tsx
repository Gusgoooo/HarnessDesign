import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { ComponentGallery } from "./ComponentGallery";

/** 占满 Storybook 预览区并禁止最外层滚动，仅 ComponentGallery 内 main 纵向滚动 */
function GalleryViewport({ children }: { children: ReactNode }) {
  return (
    <div className="box-border m-0 flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden p-0">
      {children}
    </div>
  );
}

/** 全局已关闭组件 Docs；说明见 README / 各组件独立 Story。 */
const meta = {
  title: "ALL",
  decorators: [
    (Story) => (
      <GalleryViewport>
        <Story />
      </GalleryViewport>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    harnessTokenCompliance: storyHarnessCompliance({}),
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  /** 无 component/args 时 Controls 面板会显示营销空状态；SB8 无单独隐藏该块的参数，故关闭本 story 的 Controls 面板。 */
  parameters: {
    controls: { disable: true },
  },
  render: () => <ComponentGallery />,
};
