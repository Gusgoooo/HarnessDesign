/**
 * 全屏遮罩：浅灰半透明 + 背景模糊（非深黑），与 ChatGPT 类现代浮层一致。
 * 用于 Dialog / AlertDialog / Sheet / Drawer 等 Radix Portal 遮罩。
 */
export const modalOverlayClasses =
  "fixed inset-0 z-50 bg-zinc-950/25 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 dark:bg-zinc-950/45"
