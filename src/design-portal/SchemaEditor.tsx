import { useCallback, useEffect, useState } from "react";

export interface SchemaEditorProps {
  /** 默认打开的 spec 文件名 */
  defaultFilename?: string;
}

/**
 * Schema 可视化编辑（供独立 Portal 与 Storybook 复用）。
 * 依赖开发服务器的 `/api/schema/*` 与 `/api/save-schema`（见 vite-plugin-schema-api.mjs）。
 */
export function SchemaEditor({ defaultFilename = "data-table.spec.json" }: SchemaEditorProps) {
  const [filename, setFilename] = useState(defaultFilename);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/schema/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error(await res.text());
      const raw = await res.text();
      setText(raw);
    } catch (e) {
      setStatus(`加载失败：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [filename]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setStatus(null);
    try {
      JSON.parse(text);
    } catch (e) {
      setStatus(`JSON 无效：${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    try {
      const res = await fetch("/api/save-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, jsonText: text }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error ?? res.statusText);
      setStatus("已保存并执行 sync:harness（Tailwind / .cursorrules / rules 镜像已更新）");
    } catch (e) {
      setStatus(`保存失败：${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-8">
      <header className="space-y-1 border-b border-zinc-700 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Harness Schema</h1>
        <p className="text-sm text-zinc-400">
          编辑 <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-200">src/harness/schema/components/*.spec.json</code>
          ，保存后自动同步 Tailwind、<code className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-200">.cursorrules</code> 与{" "}
          <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-200">HARNESS_RULES.md</code>。
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-400">文件</span>
          <input
            className="rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 shadow-sm"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-500"
          onClick={() => void load()}
        >
          重新加载
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 shadow-sm hover:bg-zinc-800"
          onClick={() => void save()}
        >
          保存并同步
        </button>
        {loading ? <span className="text-sm text-zinc-500">加载中…</span> : null}
      </div>

      {status ? (
        <div className="rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm whitespace-pre-wrap text-zinc-200">{status}</div>
      ) : null}

      <textarea
        className="min-h-[480px] flex-1 rounded-lg border border-zinc-600 bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-zinc-100 shadow-inner"
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}
