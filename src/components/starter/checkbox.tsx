import * as React from "react";

import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * 原生 checkbox + 与业务表格一致的视觉规格；需要三态时请在外层用 ref 设置 indeterminate。
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      role="checkbox"
      className={cn("h-4 w-4 shrink-0 rounded border border-input accent-primary", className)}
      ref={ref}
      {...props}
    />
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
