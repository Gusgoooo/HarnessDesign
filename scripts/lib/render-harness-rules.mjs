export function patternToString(p) {
  return typeof p.pattern === "string" ? p.pattern : String(p.pattern);
}

/** @param {any[]} specs */
export function renderCursorrules(specs) {
  const forbidden = specs.flatMap((s) => s.forbidden ?? []);
  const refs = [...new Set(specs.flatMap((s) => s.referencePriority ?? []))];
  const corrections = specs.flatMap((s) => s.corrections ?? []);

  const lines = [];
  lines.push(
    "# AI Component Harness — 自动生成，请勿手改（修改请编辑 schema 后运行 npm run sync:harness 或 npm run generate:rules）",
  );
  lines.push("");
  lines.push("## 引用优先");
  lines.push("- 实现 UI 时优先从以下路径导入业务组件：");
  refs.forEach((r) => lines.push(`  - ${r}`));
  lines.push("");
  lines.push("## 禁止项（原生 HTML）");
  if (forbidden.length === 0) {
    lines.push("- （当前 schema 未声明 forbidden）");
  } else {
    forbidden.forEach((f) => {
      lines.push(`- 不要使用 <${f.htmlTag}> — ${f.reason}；请改用：${f.useInstead}`);
    });
  }
  lines.push("");
  lines.push("## 样式锁定（黑名单思维）");
  lines.push("- 禁止在业务页面为表格/按钮等叠加任意值间距类（如 `m-[13px]`、`p-[7px]`）。");
  lines.push("- 禁止通过 className 覆盖下列语义（已在 harness styleLock 声明）：");
  specs.forEach((s) => {
    lines.push(`### ${s.componentName} (${s.id})`);
    (s.styleLock?.blacklist ?? []).forEach((b) => {
      lines.push(`- ${b.description} — pattern: \`${patternToString(b)}\``);
    });
  });
  lines.push("");
  lines.push("## 组件意图与 AI 指令");
  specs.forEach((s) => {
    lines.push(`### ${s.componentName}`);
    lines.push(`- **Intent**: ${s.intent}`);
    lines.push(`- **AI**: ${s.aiPrompt}`);
  });
  lines.push("");
  lines.push("## 纠错指令");
  if (corrections.length === 0) {
    lines.push("- （无）");
  } else {
    corrections.forEach((c) => {
      lines.push(`- **${c.id}**: 若 ${c.violation} → ${c.fixPrompt}`);
    });
  }
  lines.push("");
  return lines.join("\n");
}

/** Markdown 镜像（供 Code Review / 非 Cursor 工具阅读） */
/** @param {any[]} specs */
export function renderHarnessMarkdown(specs) {
  return `# Harness 规则镜像\n\n与根目录 \`.cursorrules\` 内容一致（由 \`npm run sync:harness\` 生成）；请勿手改。\n\n${renderCursorrules(specs)}`;
}
