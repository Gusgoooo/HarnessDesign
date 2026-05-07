# Harness 规则镜像

与根目录 `.cursorrules` 内容一致（由 `npm run sync:harness` 生成）；请勿手改。

# AI Component Harness — 自动生成，请勿手改（修改请编辑 schema 后运行 npm run sync:harness 或 npm run generate:rules）

## 引用优先
- 实现 UI 时优先从以下路径导入业务组件：
  - @/components/business/BusinessBadge
  - @/components/business
  - @/components/business/BusinessButton
  - @/components/business/BusinessCheckbox
  - @/components/business/DataTable
  - @/components/business/BusinessInput

## 禁止项（原生 HTML）
- 不要使用 <button> — 业务场景禁止裸 <button>，以保证圆角、间距与品牌色一致；请改用：@/components/business/BusinessButton
- 不要使用 <table> — 业务列表应走统一 DataTable，以确保间距与品牌锁一致；请改用：@/components/business/DataTable
- 不要使用 <input> — 业务场景禁止裸 <input>，以保证高度、边框与 focus 样式一致；请改用：@/components/business/BusinessInput

## 样式锁定（黑名单思维）
- 禁止在业务页面为表格/按钮等叠加任意值间距类（如 `m-[13px]`、`p-[7px]`）。
- 禁止通过 className 覆盖下列语义（已在 harness styleLock 声明）：
### BusinessBadge (business-badge)
- 禁止覆盖内边距 — pattern: `^(px-|py-|p-|pt-|pb-|pl-|pr-)`
- 禁止覆盖圆角与边框 — pattern: `^(border|rounded)`
- 禁止覆盖品牌/语义色（由 variant 映射） — pattern: `^(bg|text)-(primary|secondary|destructive|accent|muted)`
- 禁止任意值间距 — pattern: `^(m|p|gap)-\[`
### BusinessButton (business-button)
- 禁止覆盖按钮高度与内边距（由 size 映射） — pattern: `^(h-|px-|py-|p-|pt-|pb-|pl-|pr-)`
- 禁止覆盖圆角（由 design token --radius 驱动） — pattern: `^rounded`
- 禁止覆盖品牌/语义色（由 variant 映射） — pattern: `^(bg|text|border)-(primary|secondary|destructive|accent|muted)`
- 禁止任意值间距 — pattern: `^(m|p|gap|space-[xy])-\[`
### BusinessCheckbox (business-checkbox)
- 禁止覆盖尺寸 — pattern: `^(h-|w-|size-)`
- 禁止覆盖边框与圆角 — pattern: `^(border|rounded)`
- 禁止覆盖品牌色 — pattern: `^accent-`
- 禁止任意值间距 — pattern: `^(m|p|gap)-\[`
### DataTable (business-data-table)
- 禁止覆盖单元格与表头核心垂直内边距（由 density 映射） — pattern: `^(p|px|py|pt|pb|pl|pr)-`
- 禁止改动表格外边框与分割线语义 — pattern: `^(border|rounded|ring|outline|divide)-`
- 禁止覆盖品牌/语义色 — pattern: `^(bg|text|border)-(primary|secondary|destructive|accent|muted|card|popover)`
- 禁止任意值间距（AI 硬编码 m-[13px] 等） — pattern: `^(m|p|gap|space-[xy])-\[`
### BusinessInput (business-input)
- 禁止覆盖输入框高度与内边距 — pattern: `^(h-|px-|py-|p-|pt-|pb-|pl-|pr-)`
- 禁止覆盖边框与圆角 — pattern: `^(border|rounded|ring|outline)`
- 禁止任意值间距 — pattern: `^(m|p|gap|space-[xy])-\[`

## 组件意图与 AI 指令
### BusinessBadge
- **Intent**: 状态标记、标签与计数气泡的统一入口；禁止在业务页手写 span+bg 实现类似效果。
- **AI**: 需要标签/徽章时必须使用 @/components/business/BusinessBadge；通过 variant 控制风格，禁止手写背景色和间距。
### BusinessButton
- **Intent**: 所有可点击行为的统一入口：主操作、次要操作、链接导航等；禁止在业务页散落原生 <button> 并手写间距与品牌色。
- **AI**: 需要按钮时必须使用 @/components/business/BusinessButton；通过 variant 控制视觉风格，通过 size 控制尺寸；禁止在 JSX 上堆叠 h-/px-/bg-primary 等 Tailwind 覆盖。颜色仅允许 design token 语义类。
### BusinessCheckbox
- **Intent**: 勾选/取消勾选的统一入口：表单同意项、多选过滤器、批量选择等；禁止在业务页裸用 <input type=checkbox>。
- **AI**: 需要勾选框时必须使用 @/components/business/BusinessCheckbox；禁止手写尺寸与品牌色。
### DataTable
- **Intent**: 展示业务列表数据的主表格：分页、排序、批量操作在此收敛；禁止在业务页散落原生 <table> 与任意间距类。
- **AI**: 展示表格数据时必须使用 @/components/business/DataTable；通过 density/variant 表达密度与斑马纹，禁止在 JSX 上堆叠 p-/m-/border-/bg-primary 等 Tailwind；列宽用 columns 元数据或模板列，不要手写 w-[13px]。颜色与边框仅允许来自全局令牌 src/design-tokens/tokens.json 所映射的语义类（如 border-border、bg-muted），禁止手写 oklch/hex 离散值。
### BusinessInput
- **Intent**: 所有文本输入场景的统一入口：搜索、表单字段、密码等；禁止在业务页散落原生 <input> 并手写间距与边框。
- **AI**: 需要文本输入时必须使用 @/components/business/BusinessInput；禁止在 JSX 上堆叠 h-/px-/border- 等 Tailwind 覆盖。

## 纠错指令
- **no-raw-button**: 若 在 features/** 或 pages/** 使用原生 <button> → 替换为 import { BusinessButton } from '@/components/business/BusinessButton'，用 variant 和 size props 控制样式。
- **no-raw-table**: 若 在 features/** 或 pages/** 使用原生 <table> → 替换为 import { DataTable } from '@/components/business/DataTable'，数据与列定义传入 props。
- **no-hacky-spacing**: 若 在 DataTable 子树使用 m-[13px]、p-[7px] 等任意值 → 删除任意值 class，改用 DataTable 的 density 或设计约定的列模板。
- **no-raw-input**: 若 在 features/** 或 pages/** 使用原生 <input> → 替换为 import { BusinessInput } from '@/components/business/BusinessInput'。
