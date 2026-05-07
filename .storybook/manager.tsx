import * as React from "react";
import { create } from "storybook/internal/theming";
import {
  addons,
  types,
  useStorybookApi,
  type API,
} from "storybook/internal/manager-api";
import type { API_ComponentEntry, API_HashEntry } from "storybook/internal/types";

/* ── Light 主题 ── */
const theme = create({
  base: "light",
  appBg: "#ffffff",
  appContentBg: "#ffffff",
  appBorderColor: "#e4e4e7",
  appBorderRadius: 8,
  textColor: "#18181b",
  textMutedColor: "#71717a",
  barBg: "#ffffff",
  barTextColor: "#18181b",
  barSelectedColor: "#18181b",
  brandTitle: "HarnessDesign",
  colorPrimary: "#18181b",
  colorSecondary: "#18181b",
  inputBg: "#ffffff",
  inputBorder: "#e4e4e7",
  inputTextColor: "#18181b",
});

/* ── 辅助 ── */

function getImportPath(api: API, item: API_ComponentEntry): string | null {
  for (const cid of item.children) {
    try {
      const d = api.getData(cid);
      if (d && "importPath" in d && typeof (d as any).importPath === "string") return (d as any).importPath;
    } catch {}
  }
  return null;
}

/* ── 可编辑组件标签 ── */

function EditableLabel({ item, api }: { item: API_ComponentEntry; api: API }) {
  const [editing, setEditing] = React.useState(false);
  const path = React.useMemo(() => getImportPath(api, item), [api, item]);

  async function commit(v: string) {
    const t = v.trim();
    setEditing(false);
    if (!path || !t || t === item.name) return;
    try {
      const r = await fetch("/api/rename-component-title", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importPath: path, prevTitle: item.name, nextTitle: t }),
      });
      const d = (await r.json()) as any;
      if (!r.ok || !d.ok) { api.addNotification({ id: "rn-err", content: { headline: "重命名失败", subHeadline: d.error ?? r.statusText } }); return; }
      window.location.reload();
    } catch (e) { api.addNotification({ id: "rn-err", content: { headline: "重命名失败", subHeadline: String(e) } }); }
  }

  if (editing) {
    return <input defaultValue={item.name} autoFocus
      style={{ font: "inherit", color: "#18181b", width: "100%", padding: "1px 4px", borderRadius: 4, border: "1px solid #e4e4e7", background: "#fff", boxSizing: "border-box" }}
      onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); void commit(e.currentTarget.value); } if (e.key === "Escape") setEditing(false); }}
      onBlur={e => void commit(e.currentTarget.value)} />;
  }

  return <span title={path ? "双击修改" : ""} style={{ cursor: path ? "text" : "default", color: "#18181b" }}
    onDoubleClick={e => { e.preventDefault(); e.stopPropagation(); if (path) setEditing(true); }}>{item.name}</span>;
}

/* ── 内联 SVG 图标 ── */

const IcoPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
const IcoSwatch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="12" r="1" fill="currentColor"/></svg>;
const IcoX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IcoMsg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IcoImg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const IcoUp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

/* ── 添加组件弹窗 ── */

type AddMode = "text" | "image" | "upload";

function AddComponentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = React.useState<AddMode>("text");
  const [text, setText] = React.useState("");
  const [imgFile, setImgFile] = React.useState<File | null>(null);
  const [imgPrev, setImgPrev] = React.useState<string | null>(null);
  const [storyFile, setStoryFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const dlg = React.useRef<HTMLDialogElement>(null);
  const imgInput = React.useRef<HTMLInputElement>(null);
  const storyInput = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { const e = dlg.current; if (!e) return; if (open && !e.open) e.showModal(); else if (!open && e.open) e.close(); }, [open]);
  React.useEffect(() => { if (!imgFile) { setImgPrev(null); return; } const u = URL.createObjectURL(imgFile); setImgPrev(u); return () => URL.revokeObjectURL(u); }, [imgFile]);

  function reset() { setText(""); setImgFile(null); setImgPrev(null); setStoryFile(null); setBusy(false); }
  function close() { reset(); onClose(); }

  async function go(url: string, body: BodyInit | string, ct?: string) {
    setBusy(true);
    try {
      const h: Record<string, string> = ct ? { "Content-Type": ct } : {};
      const r = await fetch(url, { method: "POST", headers: h, body });
      if (r.ok) { close(); window.location.reload(); } else alert("失败: " + (await r.text()));
    } catch (e) { alert(String(e)); } finally { setBusy(false); }
  }

  const D = { bg: "#fff", border: "#e4e4e7", text: "#18181b", muted: "#71717a", blue: "#2563eb", radius: 8 };

  const tab = (m: AddMode, label: string) => (
    <button type="button" onClick={() => setMode(m)} style={{
      flex: 1, padding: "8px 0", fontSize: 13, fontWeight: mode === m ? 600 : 400,
      color: mode === m ? D.blue : D.muted, background: "none", border: "none",
      borderBottom: mode === m ? `2px solid ${D.blue}` : "2px solid transparent", cursor: "pointer", fontFamily: "inherit",
    }}>{label}</button>
  );

  const btnP = (disabled: boolean, label: string, fn: () => void) => (
    <button type="button" disabled={disabled} onClick={fn} style={{
      padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#fff", background: D.text,
      border: "none", borderRadius: D.radius, cursor: "pointer", fontFamily: "inherit", opacity: busy ? .6 : 1,
    }}>{busy ? "处理中…" : label}</button>
  );

  return (
    <dialog ref={dlg} onClose={close} onClick={e => { if (e.target === dlg.current) close(); }}
      style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", margin: 0,
        width: 500, height: 400, padding: 0,
        border: `1px solid ${D.border}`, borderRadius: 12, background: D.bg, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)",
        overflow: "hidden", color: D.text, fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${D.border}` }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>添加组件</span>
          <button type="button" onClick={close} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: D.muted, display: "flex" }}><IcoX /></button>
        </div>
        <div style={{ display: "flex", borderBottom: `1px solid ${D.border}`, padding: "0 20px" }}>
          {tab("text", "文本描述生成")}{tab("image", "图片识别生成")}{tab("upload", "上传 Story")}
        </div>
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          {mode === "text" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: D.blue }}><IcoMsg /><span style={{ fontSize: 14, fontWeight: 600 }}>用文字描述你需要的组件</span></div>
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder="例如：一个带搜索过滤的下拉选择器，支持多选…"
                style={{ width: "100%", minHeight: 120, padding: 12, fontSize: 13, fontFamily: "inherit", lineHeight: 1.6,
                  borderRadius: D.radius, border: `1px solid ${D.border}`, resize: "vertical", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.currentTarget.style.borderColor = D.blue} onBlur={e => e.currentTarget.style.borderColor = D.border} />
            </div>
          )}
          {mode === "image" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: D.blue }}><IcoImg /><span style={{ fontSize: 14, fontWeight: 600 }}>上传设计图自动生成</span></div>
              <input ref={imgInput} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) setImgFile(e.target.files[0]); }} />
              {imgPrev ? (
                <div style={{ position: "relative" }}>
                  <img src={imgPrev} alt="" style={{ width: "100%", maxHeight: 240, objectFit: "contain", borderRadius: D.radius, border: `1px solid ${D.border}`, background: "#fafafa" }} />
                  <button type="button" onClick={() => { setImgFile(null); if (imgInput.current) imgInput.current.value = ""; }}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.6)", color: "#fff", border: "none", borderRadius: 4, padding: 4, cursor: "pointer", display: "flex" }}><IcoX /></button>
                </div>
              ) : (
                <button type="button" onClick={() => imgInput.current?.click()}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 32,
                    border: `2px dashed ${D.border}`, borderRadius: D.radius, background: "#fafafa", cursor: "pointer", color: D.muted, fontSize: 13, fontFamily: "inherit" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = D.blue} onMouseLeave={e => e.currentTarget.style.borderColor = D.border}>
                  <IcoImg /><span>点击选择图片</span>
                </button>
              )}
            </div>
          )}
          {mode === "upload" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: D.blue }}><IcoUp /><span style={{ fontSize: 14, fontWeight: 600 }}>上传已有组件文件</span></div>
              <input ref={storyInput} type="file" accept=".tsx,.ts,.jsx,.js" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) setStoryFile(e.target.files[0]); }} />
              <button type="button" onClick={() => storyInput.current?.click()}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 32,
                  border: `2px dashed ${D.border}`, borderRadius: D.radius, background: storyFile ? "#f0fdf4" : "#fafafa",
                  cursor: "pointer", color: storyFile ? "#16a34a" : D.muted, fontSize: 13, fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = D.blue} onMouseLeave={e => e.currentTarget.style.borderColor = D.border}>
                <IcoUp />{storyFile ? <span style={{ fontWeight: 600 }}>{storyFile.name}</span> : <span>点击选择 *.stories.tsx</span>}
              </button>
            </div>
          )}
        </div>
        {/* 固定底部按钮栏 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 20px", borderTop: `1px solid ${D.border}` }}>
          <button type="button" onClick={close} style={{ padding: "8px 20px", fontSize: 13, background: D.bg, border: `1px solid ${D.border}`, borderRadius: D.radius, cursor: "pointer", fontFamily: "inherit" }}>取消</button>
          {mode === "text" && btnP(!text.trim() || busy, "生成组件", () => void go("/api/generate-component", JSON.stringify({ mode: "text", prompt: text.trim() }), "application/json"))}
          {mode === "image" && btnP(!imgFile || busy, "识别并生成", () => { const fd = new FormData(); fd.append("mode", "image"); fd.append("file", imgFile!); void go("/api/generate-component", fd); })}
          {mode === "upload" && btnP(!storyFile || busy, "上传组件", () => { const fd = new FormData(); fd.append("mode", "upload"); fd.append("file", storyFile!); void go("/api/upload-component", fd); })}
        </div>
      </div>
    </dialog>
  );
}

/* ── 侧边栏顶部（GPT 风格） ── */

function useHideCreateStoryButton() {
  React.useEffect(() => {
    const hide = () => {
      const sidebar = document.querySelector(".sidebar-container");
      if (!sidebar) return;
      sidebar.querySelectorAll<HTMLElement>("button").forEach((btn) => {
        if (btn.closest("#storybook-explorer-tree") || btn.closest("[data-harness-sidebar-top]")) return;
        const svg = btn.querySelector("svg");
        if (!svg) return;
        const paths = svg.querySelectorAll("path, line, polyline");
        if (paths.length <= 3 && btn.offsetWidth < 60 && btn.offsetHeight < 60) {
          btn.style.display = "none";
        }
      });
    };
    hide();
    const mo = new MutationObserver(hide);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
}

function SidebarTop() {
  const api = useStorybookApi();
  const [addOpen, setAddOpen] = React.useState(false);
  useHideCreateStoryButton();

  return (
    <div data-harness-sidebar-top="" style={{
      display: "flex", flexDirection: "column", gap: 10,
      padding: "16px 8px 12px",
      fontFamily: "system-ui,-apple-system,sans-serif",
      borderBottom: "1px solid #f0f0f0",
    }}>
      {/* 产品名称 */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#18181b", letterSpacing: "-0.01em", padding: "0 12px" }}>
        HarnessDesign
      </div>

      {/* 按钮组 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* 添加组件 — 主要按钮 */}
        <button type="button" onClick={() => setAddOpen(true)} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          width: "100%", padding: "7px 12px",
          fontSize: 13, fontWeight: 500, color: "#fff", background: "#18181b",
          border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
          transition: "background 120ms",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#333"}
          onMouseLeave={e => e.currentTarget.style.background = "#18181b"}>
          <IcoPlus /> 添加组件
        </button>

        {/* DesignToken — 次要按钮 */}
        <button type="button"
          onClick={() => api.selectStory("designtoken--docs", undefined, { viewMode: "docs" })}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            width: "100%", padding: "7px 12px",
            fontSize: 13, fontWeight: 500, color: "#52525b", background: "transparent",
            border: "1px solid #e4e4e7", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
            transition: "all 120ms",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.color = "#18181b"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#52525b"; }}>
          <IcoSwatch /> DesignToken
        </button>
      </div>

      <AddComponentDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

/* ── Harness Schema 面板 (结构化表单) ── */

type SpecData = {
  id: string;
  componentName: string;
  version: string;
  intent: string;
  wraps: { module: string; primitives: string[] };
  requiredProps: { name: string; description: string; type: string; required: boolean; defaultValue?: unknown; enumMap?: Record<string, string[]> }[];
  optionalProps?: { name: string; description: string; type: string; required: boolean; defaultValue?: unknown; enumMap?: Record<string, string[]> }[];
  styleLock: { baselineTokens: string[]; blacklist: { description: string; pattern: string }[] };
  aiPrompt: string;
  forbidden?: { htmlTag: string; reason: string; useInstead: string }[];
  corrections?: { id: string; violation: string; fixPrompt: string }[];
  referencePriority: string[];
  tailwindExtend?: Record<string, Record<string, string>>;
  meta?: Record<string, unknown>;
};

type SchemaListItem = { filename: string; id: string; componentName: string };

const HS = {
  wrap: { padding: 0, fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 13, display: "flex", flexDirection: "column" as const, height: "100%", boxSizing: "border-box" as const, background: "#fff" },
  header: { display: "flex", alignItems: "center" as const, gap: 8, padding: "10px 16px", borderBottom: "1px solid #e4e4e7", flexShrink: 0 as const },
  body: { flex: 1, overflowY: "auto" as const, padding: "16px" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 600 as const, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 8 },
  field: { display: "flex", flexDirection: "column" as const, gap: 4, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 500 as const, color: "#52525b" },
  input: { padding: "6px 10px", fontSize: 13, border: "1px solid #e4e4e7", borderRadius: 6, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as const, outline: "none" },
  textarea: { padding: "6px 10px", fontSize: 13, border: "1px solid #e4e4e7", borderRadius: 6, fontFamily: "inherit", width: "100%", boxSizing: "border-box" as const, minHeight: 60, resize: "vertical" as const, outline: "none", lineHeight: 1.5 },
  mono: { padding: "6px 10px", fontSize: 12, border: "1px solid #e4e4e7", borderRadius: 6, fontFamily: "ui-monospace,monospace", width: "100%", boxSizing: "border-box" as const, minHeight: 40, resize: "vertical" as const, outline: "none", lineHeight: 1.5 },
  tag: { display: "inline-block", padding: "2px 8px", fontSize: 11, background: "#f4f4f5", borderRadius: 4, color: "#3f3f46", marginRight: 4, marginBottom: 4 },
  btn: (primary?: boolean) => ({
    padding: "6px 14px", fontSize: 12, fontWeight: 500 as const, border: primary ? "none" : "1px solid #e4e4e7",
    borderRadius: 6, cursor: "pointer" as const, fontFamily: "inherit",
    background: primary ? "#18181b" : "#fff", color: primary ? "#fff" : "#18181b",
  }),
  select: { padding: "6px 10px", fontSize: 13, border: "1px solid #e4e4e7", borderRadius: 6, fontFamily: "inherit", background: "#fff", outline: "none" },
  status: { padding: "8px 12px", fontSize: 12, borderRadius: 6, margin: "0 16px 8px", whiteSpace: "pre-wrap" as const } as React.CSSProperties,
  propRow: { display: "flex", gap: 8, alignItems: "flex-start" as const, padding: "8px 0", borderBottom: "1px solid #f4f4f5" },
  propName: { fontSize: 13, fontWeight: 600 as const, color: "#18181b", minWidth: 100, flexShrink: 0 as const },
  blacklistRow: { display: "flex", gap: 8, alignItems: "center" as const, padding: "6px 0", borderBottom: "1px solid #f4f4f5" },
};

function PropEditor({ prop, onChange }: { prop: SpecData["requiredProps"][0]; onChange: (p: SpecData["requiredProps"][0]) => void }) {
  return (
    <div style={{ border: "1px solid #e4e4e7", borderRadius: 6, padding: 10, marginBottom: 8, background: "#fafafa" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={HS.label}>名称</div>
          <input style={HS.input} value={prop.name} onChange={e => onChange({ ...prop, name: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={HS.label}>类型</div>
          <input style={HS.input} value={prop.type} onChange={e => onChange({ ...prop, type: e.target.value })} />
        </div>
      </div>
      <div style={HS.label}>描述</div>
      <input style={HS.input} value={prop.description} onChange={e => onChange({ ...prop, description: e.target.value })} />
      {prop.enumMap && (
        <div style={{ marginTop: 6 }}>
          <div style={HS.label}>枚举映射 (JSON)</div>
          <textarea style={HS.mono} value={JSON.stringify(prop.enumMap, null, 2)} onChange={e => {
            try { const v = JSON.parse(e.target.value); onChange({ ...prop, enumMap: v }); } catch {}
          }} />
        </div>
      )}
    </div>
  );
}

function BlacklistEditor({ rules, onChange }: { rules: SpecData["styleLock"]["blacklist"]; onChange: (r: SpecData["styleLock"]["blacklist"]) => void }) {
  return (
    <div>
      {rules.map((rule, i) => (
        <div key={i} style={HS.blacklistRow}>
          <div style={{ flex: 2 }}>
            <input style={HS.input} placeholder="描述" value={rule.description} onChange={e => {
              const n = [...rules]; n[i] = { ...rule, description: e.target.value }; onChange(n);
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <input style={{ ...HS.input, fontFamily: "ui-monospace,monospace", fontSize: 12 }} placeholder="pattern" value={rule.pattern} onChange={e => {
              const n = [...rules]; n[i] = { ...rule, pattern: e.target.value }; onChange(n);
            }} />
          </div>
          <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#a1a1aa", padding: 4 }} onClick={() => {
            const n = rules.filter((_, j) => j !== i); onChange(n);
          }}><IcoX /></button>
        </div>
      ))}
      <button type="button" style={{ ...HS.btn(), fontSize: 11, marginTop: 6 }} onClick={() => {
        onChange([...rules, { description: "", pattern: "" }]);
      }}>+ 添加黑名单规则</button>
    </div>
  );
}

function useCurrentStoryTitle(): string | null {
  const api = useStorybookApi();
  const [title, setTitle] = React.useState<string | null>(null);
  React.useEffect(() => {
    function sync() {
      try {
        const current = api.getCurrentStoryData?.();
        if (current && "title" in current && typeof current.title === "string") {
          const t = current.title.split("/").pop() ?? current.title;
          setTitle(t);
        }
      } catch {}
    }
    sync();
    const channel = addons.getChannel();
    channel.on("storyChanged", sync);
    channel.on("setCurrentStory", sync);
    const timer = setInterval(sync, 500);
    return () => { channel.off("storyChanged", sync); channel.off("setCurrentStory", sync); clearInterval(timer); };
  }, [api]);
  return title;
}

function matchSchemaForTitle(schemas: SchemaListItem[], title: string | null): SchemaListItem | null {
  if (!title || schemas.length === 0) return null;
  const lower = title.toLowerCase().replace(/\s+/g, "");
  return schemas.find(s => s.componentName.toLowerCase() === lower)
    ?? schemas.find(s => lower.includes(s.componentName.toLowerCase()))
    ?? schemas.find(s => s.componentName.toLowerCase().includes(lower))
    ?? null;
}

function HarnessPanel() {
  const [schemas, setSchemas] = React.useState<SchemaListItem[]>([]);
  const [filename, setFilename] = React.useState("");
  const [spec, setSpec] = React.useState<SpecData | null>(null);
  const [status, setStatus] = React.useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const currentTitle = useCurrentStoryTitle();

  React.useEffect(() => {
    fetch("/api/schemas").then(r => r.json()).then((list: SchemaListItem[]) => {
      setSchemas(list);
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    const matched = matchSchemaForTitle(schemas, currentTitle);
    if (matched && matched.filename !== filename) {
      setFilename(matched.filename);
    }
  }, [currentTitle, schemas]);

  const load = React.useCallback(async () => {
    if (!filename) return;
    setLoading(true); setStatus(null);
    try {
      const r = await fetch(`/api/schema/${encodeURIComponent(filename)}`);
      if (!r.ok) throw new Error(await r.text());
      setSpec(await r.json());
    } catch (e) { setStatus({ text: `加载失败：${String(e)}`, ok: false }); }
    finally { setLoading(false); }
  }, [filename]);

  React.useEffect(() => { void load(); }, [load]);

  function update<K extends keyof SpecData>(key: K, val: SpecData[K]) {
    if (!spec) return;
    setSpec({ ...spec, [key]: val });
  }

  async function save() {
    if (!spec || !filename) return;
    setStatus(null);
    try {
      const r = await fetch("/api/save-schema", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, jsonText: JSON.stringify(spec, null, 2) }),
      });
      const b = await r.json().catch(() => ({})) as any;
      if (!r.ok || !b.ok) throw new Error(b.error ?? r.statusText);
      const auditInfo = b.audit?.passed === false ? `\n⚠️ 审计: ${b.audit.output}` : "";
      setStatus({ text: `已保存并同步 ✓${auditInfo}`, ok: b.audit?.passed !== false });
    } catch (e) { setStatus({ text: `保存失败：${String(e)}`, ok: false }); }
  }

  const matched = matchSchemaForTitle(schemas, currentTitle);

  if (!matched && currentTitle) {
    return (
      <div style={{ ...HS.wrap, alignItems: "center", justifyContent: "center", color: "#a1a1aa", gap: 8, padding: 24, textAlign: "center" as const }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#52525b" }}>{currentTitle}</div>
        <div>该组件尚未创建 Harness Schema</div>
      </div>
    );
  }

  if (loading && !spec) {
    return <div style={{ ...HS.wrap, alignItems: "center", justifyContent: "center", color: "#a1a1aa" }}>加载中…</div>;
  }

  if (!spec) {
    return <div style={{ ...HS.wrap, alignItems: "center", justifyContent: "center", color: "#a1a1aa" }}>请在左侧选择一个组件</div>;
  }

  return (
    <div style={HS.wrap}>
      {/* 顶栏 */}
      <div style={HS.header}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#18181b" }}>{spec.componentName}</div>
        <span style={{ fontSize: 11, color: "#a1a1aa", fontFamily: "ui-monospace,monospace" }}>{filename}</span>
        <div style={{ flex: 1 }} />
        <button type="button" style={HS.btn()} onClick={() => void load()}>刷新</button>
        <button type="button" style={HS.btn(true)} onClick={() => void save()}>保存</button>
      </div>

      {status && (
        <div style={{ ...HS.status, background: status.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${status.ok ? "#bbf7d0" : "#fecaca"}`, color: status.ok ? "#166534" : "#991b1b" }}>
          {status.text}
        </div>
      )}

      {/* 表单主体 */}
      <div style={HS.body}>
        {/* 基本信息 */}
        <div style={HS.section}>
          <div style={HS.sectionTitle}>基本信息</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ ...HS.field, flex: 1 }}>
              <div style={HS.label}>组件名称</div>
              <input style={HS.input} value={spec.componentName} onChange={e => update("componentName", e.target.value)} />
            </div>
            <div style={{ ...HS.field, flex: 1 }}>
              <div style={HS.label}>ID</div>
              <input style={HS.input} value={spec.id} onChange={e => update("id", e.target.value)} />
            </div>
            <div style={{ ...HS.field, width: 100, flexShrink: 0 }}>
              <div style={HS.label}>版本</div>
              <input style={HS.input} value={spec.version} onChange={e => update("version", e.target.value as any)} />
            </div>
          </div>
          <div style={HS.field}>
            <div style={HS.label}>业务意图</div>
            <textarea style={HS.textarea} value={spec.intent} onChange={e => update("intent", e.target.value)} />
          </div>
        </div>

        {/* 上游封装 */}
        <div style={HS.section}>
          <div style={HS.sectionTitle}>上游封装</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ ...HS.field, flex: 1 }}>
              <div style={HS.label}>模块路径</div>
              <input style={HS.input} value={spec.wraps.module} onChange={e => update("wraps", { ...spec.wraps, module: e.target.value })} />
            </div>
            <div style={{ ...HS.field, flex: 1 }}>
              <div style={HS.label}>Primitives (逗号分隔)</div>
              <input style={HS.input} value={spec.wraps.primitives.join(", ")} onChange={e => update("wraps", { ...spec.wraps, primitives: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
            </div>
          </div>
        </div>

        {/* Props */}
        <div style={HS.section}>
          <div style={HS.sectionTitle}>必需 Props ({spec.requiredProps.length})</div>
          {spec.requiredProps.map((p, i) => (
            <PropEditor key={`req-${i}`} prop={p} onChange={np => {
              const arr = [...spec.requiredProps]; arr[i] = np; update("requiredProps", arr);
            }} />
          ))}
        </div>

        {spec.optionalProps && spec.optionalProps.length > 0 && (
          <div style={HS.section}>
            <div style={HS.sectionTitle}>可选 Props ({spec.optionalProps.length})</div>
            {spec.optionalProps.map((p, i) => (
              <PropEditor key={`opt-${i}`} prop={p} onChange={np => {
                const arr = [...(spec.optionalProps ?? [])]; arr[i] = np; update("optionalProps", arr);
              }} />
            ))}
          </div>
        )}

        {/* AI 指令 */}
        <div style={HS.section}>
          <div style={HS.sectionTitle}>AI 指令</div>
          <div style={HS.field}>
            <div style={HS.label}>AI Prompt (进入 .cursorrules)</div>
            <textarea style={{ ...HS.textarea, minHeight: 80 }} value={spec.aiPrompt} onChange={e => update("aiPrompt", e.target.value)} />
          </div>
        </div>

        {/* 样式锁定 */}
        <div style={HS.section}>
          <div style={HS.sectionTitle}>样式锁定</div>
          <div style={HS.field}>
            <div style={HS.label}>Baseline Tokens (逗号分隔)</div>
            <input style={HS.input} value={spec.styleLock.baselineTokens.join(", ")} onChange={e => update("styleLock", { ...spec.styleLock, baselineTokens: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
          </div>
          <div style={HS.field}>
            <div style={HS.label}>黑名单规则</div>
            <BlacklistEditor rules={spec.styleLock.blacklist} onChange={bl => update("styleLock", { ...spec.styleLock, blacklist: bl })} />
          </div>
        </div>

        {/* 禁止项 */}
        {spec.forbidden && spec.forbidden.length > 0 && (
          <div style={HS.section}>
            <div style={HS.sectionTitle}>禁止项</div>
            {spec.forbidden.map((f, i) => (
              <div key={i} style={{ border: "1px solid #e4e4e7", borderRadius: 6, padding: 10, marginBottom: 8, background: "#fafafa" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 0, minWidth: 80 }}>
                    <div style={HS.label}>HTML 标签</div>
                    <input style={{ ...HS.input, fontFamily: "ui-monospace,monospace" }} value={f.htmlTag} onChange={e => {
                      const arr = [...(spec.forbidden ?? [])]; arr[i] = { ...f, htmlTag: e.target.value }; update("forbidden", arr);
                    }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={HS.label}>原因</div>
                    <input style={HS.input} value={f.reason} onChange={e => {
                      const arr = [...(spec.forbidden ?? [])]; arr[i] = { ...f, reason: e.target.value }; update("forbidden", arr);
                    }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={HS.label}>替代组件</div>
                    <input style={HS.input} value={f.useInstead} onChange={e => {
                      const arr = [...(spec.forbidden ?? [])]; arr[i] = { ...f, useInstead: e.target.value }; update("forbidden", arr);
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 纠错 */}
        {spec.corrections && spec.corrections.length > 0 && (
          <div style={HS.section}>
            <div style={HS.sectionTitle}>纠错指令</div>
            {spec.corrections.map((c, i) => (
              <div key={i} style={{ border: "1px solid #e4e4e7", borderRadius: 6, padding: 10, marginBottom: 8, background: "#fafafa" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 120, flexShrink: 0 }}>
                    <div style={HS.label}>ID</div>
                    <input style={{ ...HS.input, fontFamily: "ui-monospace,monospace", fontSize: 12 }} value={c.id} onChange={e => {
                      const arr = [...(spec.corrections ?? [])]; arr[i] = { ...c, id: e.target.value }; update("corrections", arr);
                    }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={HS.label}>违规描述</div>
                    <input style={HS.input} value={c.violation} onChange={e => {
                      const arr = [...(spec.corrections ?? [])]; arr[i] = { ...c, violation: e.target.value }; update("corrections", arr);
                    }} />
                  </div>
                </div>
                <div style={HS.label}>修复指令</div>
                <input style={HS.input} value={c.fixPrompt} onChange={e => {
                  const arr = [...(spec.corrections ?? [])]; arr[i] = { ...c, fixPrompt: e.target.value }; update("corrections", arr);
                }} />
              </div>
            ))}
          </div>
        )}

        {/* 引用优先 */}
        <div style={HS.section}>
          <div style={HS.sectionTitle}>引用优先</div>
          <div style={HS.field}>
            <div style={HS.label}>路径 (每行一个)</div>
            <textarea style={{ ...HS.mono, minHeight: 40 }} value={spec.referencePriority.join("\n")} onChange={e => update("referencePriority", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 注册 ── */

addons.setConfig({
  theme,
  sidebar: {
    showRoots: false,
    renderLabel: (item: API_HashEntry, api: API) => {
      if (item.type === "component") return <EditableLabel item={item} api={api} />;
      return undefined;
    },
  },
});

addons.register("harness-design", () => {
  addons.add("harness-design/sidebar-top", {
    type: types.experimental_SIDEBAR_TOP,
    render: () => <SidebarTop />,
  });

  addons.add("harness-design/harness-panel", {
    type: types.PANEL,
    title: "Harness",
    render: ({ active }) => active ? <HarnessPanel /> : null,
  });
});
