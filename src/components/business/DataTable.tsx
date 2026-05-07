import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mergeWithBusinessSpec } from "@/components/business/business-style";
import dataTableSpec from "@/harness/schema/components/data-table.spec.json";
import type { ComponentSpec } from "@/harness/schema/types";

const spec = dataTableSpec as ComponentSpec;

export type ColumnDef<T> = {
  id: string;
  header: React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
};

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  density?: "compact" | "comfortable" | "default";
  variant?: "plain" | "striped";
  className?: string;
}

function densityClasses(density: NonNullable<DataTableProps<unknown>["density"]>): string[] {
  const map = spec.optionalProps?.find((p) => p.name === "density")?.enumMap;
  if (!map) return ["text-sm", "py-3", "px-3"];
  const key = density === undefined ? "default" : density;
  return [...(map[key] ?? map.default ?? [])];
}

function variantClasses(variant: NonNullable<DataTableProps<unknown>["variant"]>): string[] {
  const map = spec.optionalProps?.find((p) => p.name === "variant")?.enumMap;
  if (!map) return [];
  return [...(map[variant] ?? [])];
}

/**
 * BusinessTable：由 ComponentSpec 驱动密度/变体映射；consumer className 经黑名单剥离后再 merge。
 * Schema 即单一事实来源（aiPrompt、styleLock 同步参与 generate-cursorrules）。
 * 语义色/边框等来自全局令牌：`src/design-tokens/tokens.json`（`border-border`、`bg-card` 等），勿在业务中硬编码色值。
 */
export function DataTable<T>({
  columns,
  data,
  density = "default",
  variant = "plain",
  className,
}: DataTableProps<T>) {
  const rowTokens = twMerge(...densityClasses(density), ...variantClasses(variant));
  const root = mergeWithBusinessSpec(className, spec);

  return (
    <div className={root}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.id} className={rowTokens}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={col.id} className={rowTokens}>
                  {col.accessor ? col.accessor(row) : null}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

DataTable.displayName = "DataTable";
