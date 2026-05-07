import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/starter/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

function HeaderSelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <Checkbox ref={ref} checked={checked} onChange={onChange} aria-label="全选" />;
}

export type KitchenSinkRow = {
  id: string;
  name: string;
  role: string;
  revenue: number;
};

export type SortKey = "name" | "role" | "revenue" | null;
export type SortDir = "asc" | "desc";

export interface KitchenSinkDataTableProps {
  data: KitchenSinkRow[];
  density?: "compact" | "comfortable" | "default";
  variant?: "plain" | "striped";
  /** 为「角色」列加浅底区分（演示用） */
  roleColumnTint?: boolean;
  /** 表格外层额外 class（如 min-w、rounded） */
  tableClassName?: string;
}

/** 文本列：与 density 一致 */
function densityTextRowClass(d: NonNullable<KitchenSinkDataTableProps["density"]>) {
  switch (d) {
    case "compact":
      return "text-xs py-2 px-3";
    case "comfortable":
      return "text-sm py-4 px-4";
    default:
      return "text-sm py-3 px-3";
  }
}

/**
 * 复选框列：固定列宽 + 与文本行相同的纵向 padding，保证整列 checkbox 在同一竖轴上且与表头对齐。
 */
function densityCheckColumnClass(d: NonNullable<KitchenSinkDataTableProps["density"]>) {
  const fixed = "w-11 min-w-[2.75rem] max-w-[2.75rem] box-border px-0 text-center align-middle";
  switch (d) {
    case "compact":
      return cn(fixed, "text-xs py-2");
    case "comfortable":
      return cn(fixed, "text-sm py-4");
    default:
      return cn(fixed, "text-sm py-3");
  }
}

function useSortedRows(data: KitchenSinkRow[], sortKey: SortKey, sortDir: SortDir) {
  return React.useMemo(() => {
    if (!sortKey) return data;
    const mul = sortDir === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      if (sortKey === "revenue") return (a.revenue - b.revenue) * mul;
      return String(a[sortKey]).localeCompare(String(b[sortKey]), "zh") * mul;
    });
  }, [data, sortKey, sortDir]);
}

/**
 * Storybook 演示用：排序 + 行多选 + 全选（不替代业务 DataTable，仅展示复合能力）。
 */
export function KitchenSinkDataTable({
  data,
  density = "default",
  variant = "plain",
  roleColumnTint = true,
  tableClassName,
}: KitchenSinkDataTableProps) {
  const textRow = densityTextRowClass(density);
  const checkCol = densityCheckColumnClass(density);
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());

  const sorted = useSortedRows(data, sortKey, sortDir);

  const toggleSort = (key: Exclude<SortKey, null>) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const allSelected = sorted.length > 0 && sorted.every((r) => selected.has(r.id));
  const someSelected = sorted.some((r) => selected.has(r.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(sorted.map((r) => r.id)));
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const SortIcon = ({ column }: { column: Exclude<SortKey, null> }) => {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5" />
    );
  };

  return (
    <div className={cn("w-full overflow-x-auto", tableClassName)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className={cn(
                checkCol,
                "h-auto min-h-0 font-medium text-muted-foreground",
              )}
            >
              <div className="flex items-center justify-center leading-none">
                <HeaderSelectAllCheckbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </div>
            </TableHead>
            <TableHead className={cn(textRow, "cursor-pointer select-none")} onClick={() => toggleSort("name")}>
              名称
              <SortIcon column="name" />
            </TableHead>
            <TableHead
              className={cn(textRow, roleColumnTint && "bg-muted/40", "cursor-pointer select-none")}
              onClick={() => toggleSort("role")}
            >
              角色
              <SortIcon column="role" />
            </TableHead>
            <TableHead
              className={cn(textRow, "cursor-pointer select-none text-right")}
              onClick={() => toggleSort("revenue")}
            >
              营收（万）
              <SortIcon column="revenue" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row, i) => (
            <TableRow
              key={row.id}
              className={cn(
                variant === "striped" && i % 2 === 1 ? "bg-muted/25" : undefined,
                selected.has(row.id) ? "bg-primary/5" : undefined,
              )}
            >
              <TableCell className={checkCol}>
                <div className="flex items-center justify-center leading-none">
                  <Checkbox
                    checked={selected.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    aria-label={`选择 ${row.name}`}
                  />
                </div>
              </TableCell>
              <TableCell className={textRow}>{row.name}</TableCell>
              <TableCell className={cn(textRow, roleColumnTint && "bg-muted/30")}>{row.role}</TableCell>
              <TableCell className={cn(textRow, "text-right tabular-nums")}>{row.revenue.toLocaleString("zh-CN")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
