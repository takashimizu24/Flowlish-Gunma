"use client";

import { useEffect, useRef, useState } from "react";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const btn: React.CSSProperties = { border: "1px solid #d8d8d8", background: "#fff", borderRadius: 7, padding: "6px 10px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#333", lineHeight: 1 };

/** Lightweight rich-text editor (contentEditable) that outputs semantic HTML
 *  (<b>/<h3>/<ul>/<a>/<img>) and mirrors it into a hidden field for the form.
 *  Inline styles are avoided on purpose — microCMS strips them on save. */
export default function RichEditor({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.innerHTML = defaultValue
        ? (/</.test(defaultValue) ? defaultValue : `<p>${esc(defaultValue).replace(/\n/g, "<br>")}</p>`)
        : "";
      setHtml(el.innerHTML);
    }
    try { document.execCommand("styleWithCSS", false, "false"); } catch { /* ignore */ }
  }, [defaultValue]);

  const sync = () => { if (ref.current) setHtml(ref.current.innerHTML); };
  const cmd = (command: string, value?: string) => { ref.current?.focus(); try { document.execCommand(command, false, value); } catch { /* ignore */ } sync(); };

  const addLink = () => { const url = prompt("リンク先URL", "https://"); if (url) cmd("createLink", url); };

  const addImage = async (file: File) => {
    setBusy(true);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/admin/media", { method: "POST", body: fd });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok && d.url) { ref.current?.focus(); try { document.execCommand("insertHTML", false, `<img src="${d.url}" alt="">`); } catch { /* ignore */ } sync(); }
    else alert(d.error || "画像アップロードに失敗しました");
  };

  const keep = (e: React.MouseEvent) => e.preventDefault(); // keep the editor selection

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        <button type="button" style={btn} onMouseDown={keep} onClick={() => cmd("bold")}>太字</button>
        <button type="button" style={btn} onMouseDown={keep} onClick={() => cmd("formatBlock", "h3")}>見出し</button>
        <button type="button" style={btn} onMouseDown={keep} onClick={() => cmd("formatBlock", "p")}>本文</button>
        <button type="button" style={btn} onMouseDown={keep} onClick={() => cmd("insertUnorderedList")}>• リスト</button>
        <button type="button" style={btn} onMouseDown={keep} onClick={addLink}>🔗 リンク</button>
        <label style={{ ...btn, display: "inline-flex", alignItems: "center", opacity: busy ? 0.5 : 1 }} onMouseDown={keep}>
          {busy ? "アップ中…" : "🖼 画像"}
          <input type="file" accept="image/*" style={{ display: "none" }} disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); e.currentTarget.value = ""; }} />
        </label>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={sync} className="rich-editor" />
      <textarea name={name} value={html} readOnly style={{ display: "none" }} />
    </div>
  );
}
