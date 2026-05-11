import type { Meta, StoryObj } from "@storybook/react";
import { storyHarnessCompliance } from "@/design-tokens/story-preview-shell";
import { autoClassControls, spreadAutoPreviewProps, type ClassOverrideArgs } from "@/design-tokens/tw-class-audit";
import componentSrc from "./composite-data-table.tsx?raw";
import { DataTable, type ColumnDef, type DataTableProps } from "./DataTable";
import {
  KitchenSinkDataTable,
  type KitchenSinkRow,
} from "./kitchen-sink-data-table";

const audit = autoClassControls(componentSrc);

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

type DataTableStoryArgs = {
  columns: ColumnDef<Row>[];
  data: Row[];
  density: "compact" | "comfortable" | "default";
  variant: "plain" | "striped";
  columnBandIndex: number | null;
  className?: string;
  [k: string]: unknown;
};

const meta = {
  title: "Table",
  component: DataTable,
  parameters: {
    harnessTokenCompliance: storyHarnessCompliance({
      ignoreArgNames: ["columns", "data", "density", "variant", "columnBandIndex"],
    }),
  },
  args: {
    columns,
    data: sampleData,
    density: "default",
    variant: "plain",
    columnBandIndex: null as null | 0 | 1,
    ...audit.args,
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
    columnBandIndex: {
      control: "select",
      options: [null, 0, 1],
      description: "纵向浅底条带：第 N 列",
      table: { category: "表格" },
    },
    className: { table: { disable: true } },
    columns: { table: { disable: true } },
    data: { table: { disable: true } },
    ...audit.argTypes,
  },
} satisfies Meta<DataTableStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: "交互画布",
  render: (args) => {
    const a = args as DataTableStoryArgs;
    return (
      <DataTable<Row>
        columns={a.columns}
        data={a.data}
        density={a.density}
        variant={a.variant}
        columnBandIndex={a.columnBandIndex}
        className={spreadAutoPreviewProps(audit, a as ClassOverrideArgs).className}
      />
    );
  },
};

export const CompactStriped: Story = {
  name: "紧凑+斑马纹",
  args: {
    density: "compact",
    variant: "striped",
  },
  render: (args) => {
    const a = args as DataTableStoryArgs;
    return (
      <DataTable<Row>
        columns={a.columns}
        data={a.data}
        density={a.density}
        variant={a.variant}
        columnBandIndex={a.columnBandIndex}
        className={spreadAutoPreviewProps(audit, a as ClassOverrideArgs).className}
      />
    );
  },
};

export const Comfortable: Story = {
  name: "宽松",
  args: {
    density: "comfortable",
    variant: "plain",
  },
  render: (args) => {
    const a = args as DataTableStoryArgs;
    return (
      <DataTable<Row>
        columns={a.columns}
        data={a.data}
        density={a.density}
        variant={a.variant}
        columnBandIndex={a.columnBandIndex}
        className={spreadAutoPreviewProps(audit, a as ClassOverrideArgs).className}
      />
    );
  },
};

export const SuperComposite: Story = {
  name: "复合表格",
  args: {
    density: "default",
    variant: "striped",
    columnBandIndex: null,
  },
  render: (args) => {
    const a = args as DataTableStoryArgs;
    return (
      <KitchenSinkDataTable
        data={sinkData}
        density={a.density}
        variant={a.variant}
        columnBandIndex={a.columnBandIndex}
        className={spreadAutoPreviewProps(audit, a as ClassOverrideArgs).className}
      />
    );
  },
};
