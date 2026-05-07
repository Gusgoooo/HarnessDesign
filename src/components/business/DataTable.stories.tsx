import type { Meta, StoryObj } from "@storybook/react";
import { cn } from "@/lib/utils";
import {
  cssVar,
  layoutMaxWidthTokenIds,
  layoutMinWidthTokenIds,
  tokenIdsByCategory,
} from "@/design-tokens/story-controls";
import { DataTable, type ColumnDef, type DataTableProps } from "./DataTable";
import {
  KitchenSinkDataTable,
  type KitchenSinkDataTableProps,
  type KitchenSinkRow,
} from "./kitchen-sink-data-table";

type Row = { id: string; name: string; role: string };

const columns: ColumnDef<Row>[] = [
  { id: "name", header: "名称", accessor: (r) => r.name },
  { id: "role", header: "角色", accessor: (r) => r.role },
];

const sampleData: Row[] = [
  { id: "1", name: "Northwind", role: "客户" },
  { id: "2", name: "Contoso", role: "渠道" },
  { id: "3", name: "Fabrikam", role: "供应商" },
];

const sinkData: KitchenSinkRow[] = [
  { id: "1", name: "Northwind", role: "客户", revenue: 128 },
  { id: "2", name: "Contoso", role: "渠道", revenue: 86 },
  { id: "3", name: "Fabrikam", role: "供应商", revenue: 210 },
  { id: "4", name: "Adventure", role: "客户", revenue: 54 },
  { id: "5", name: "Litware", role: "渠道", revenue: 92 },
];

/* ─── 画布装饰层 ─── */

interface PreviewFrameProps {
  outerPadding: string;
  cardPadding: string;
  borderRadius: string;
  maxWidth: string;
  minWidth: string;
  shadow: string;
  showBorder: boolean;
  children: React.ReactNode;
}

function PreviewFrame({
  outerPadding,
  cardPadding,
  borderRadius,
  maxWidth,
  minWidth,
  shadow,
  showBorder,
  children,
}: PreviewFrameProps) {
  return (
    <div
      className="flex w-full items-start justify-center bg-transparent"
      style={{ padding: cssVar(outerPadding) }}
    >
      <div
        className={cn("box-border w-full bg-background", showBorder ? "border border-border" : "border-0")}
        style={{
          padding: cssVar(cardPadding),
          borderRadius: cssVar(borderRadius),
          maxWidth: cssVar(maxWidth),
          boxShadow: cssVar(shadow),
          marginLeft: "auto",
          marginRight: "auto",
          overflow: "hidden",
        }}
      >
        <div style={{ minWidth: cssVar(minWidth) }} className="w-full overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

const layoutArgTypes = {
  outerPadding: {
    control: "select",
    options: tokenIdsByCategory("spacing"),
    description: "外层间距（spacing token）",
    table: { category: "布局" },
  },
  cardPadding: {
    control: "select",
    options: tokenIdsByCategory("spacing"),
    description: "卡片内边距",
    table: { category: "布局" },
  },
  borderRadius: {
    control: "select",
    options: tokenIdsByCategory("radius-scale"),
    description: "卡片圆角",
    table: { category: "布局" },
  },
  maxWidth: {
    control: "select",
    options: layoutMaxWidthTokenIds(),
    description: "最大宽度",
    table: { category: "布局" },
  },
  minWidth: {
    control: "select",
    options: layoutMinWidthTokenIds(),
    description: "表格最小宽度",
    table: { category: "布局" },
  },
  shadow: {
    control: "select",
    options: tokenIdsByCategory("elevation"),
    description: "阴影",
    table: { category: "布局" },
  },
  showBorder: {
    control: "boolean",
    description: "显示卡片描边",
    table: { category: "布局" },
  },
} as const;

const layoutDefaults = {
  outerPadding: "space-6",
  cardPadding: "space-6",
  borderRadius: "radius-token-xl",
  maxWidth: "layout-max-w-5xl",
  minWidth: "layout-min-w-lg",
  shadow: "elevation-sm",
  showBorder: true,
};

/* ─── 基础 DataTable ─── */

const meta = {
  title: "DataTable",
  component: DataTable,
  tags: ["autodocs"],
  args: {
    columns,
    data: sampleData,
    density: "default",
    variant: "plain",
  },
  argTypes: {
    density: {
      control: "select",
      options: ["compact", "comfortable", "default"],
    },
    variant: {
      control: "select",
      options: ["plain", "striped"],
    },
    className: { control: "text" },
    columns: { table: { disable: true } },
    data: { table: { disable: true } },
  },
} satisfies Meta<DataTableProps<Row>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: "交互画布",
};

export const CompactStriped: Story = {
  name: "紧凑 + 斑马纹",
  args: { density: "compact", variant: "striped" },
};

export const Comfortable: Story = {
  name: "宽松",
  args: { density: "comfortable", variant: "plain" },
};

/* ─── 复合表格（KitchenSink + 画布装饰）─── */

type SinkArgs = Pick<KitchenSinkDataTableProps, "density" | "variant" | "roleColumnTint"> & typeof layoutDefaults;

export const SuperComposite: StoryObj<SinkArgs> = {
  name: "复合表格（排序 + 多选 + 可调边距）",
  args: {
    density: "default",
    variant: "striped",
    roleColumnTint: true,
    ...layoutDefaults,
    outerPadding: "space-0",
    cardPadding: "space-2",
    shadow: "elevation-none"
  },
  argTypes: {
    density: {
      control: "select",
      options: ["compact", "comfortable", "default"],
      table: { category: "表格" },
    },
    variant: {
      control: "select",
      options: ["plain", "striped"],
      table: { category: "表格" },
    },
    roleColumnTint: {
      control: "boolean",
      description: "角色列浅底色",
      table: { category: "表格" },
    },
    ...layoutArgTypes,
  },
  render: (args) => (
    <PreviewFrame
      outerPadding={args.outerPadding}
      cardPadding={args.cardPadding}
      borderRadius={args.borderRadius}
      maxWidth={args.maxWidth}
      minWidth={args.minWidth}
      shadow={args.shadow}
      showBorder={args.showBorder}
    >
      <KitchenSinkDataTable
        data={sinkData}
        density={args.density}
        variant={args.variant}
        roleColumnTint={args.roleColumnTint}
      />
    </PreviewFrame>
  ),
  parameters: {
    docs: {
      description: {
        story: "演示用复合表：点击表头排序、行/全选 checkbox。布局参数均从 DesignToken 中选取。",
      },
    },
  },
};
