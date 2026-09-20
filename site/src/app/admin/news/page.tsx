"use client";

import { useState } from "react";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { NEWS_CATEGORIES } from "@/lib/adminOptions";

const label: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: 13, margin: "18px 0 6px" };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "11px 12px", fontSize: 15, border: "1px solid #d8d8d8", borderRadius: 9, background: "#fff" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "8px 24px 24px", boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)" };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewsForm() {
  const [cats, setCats] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function toggle(c: string) {
    setCats((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const form = new FormData(e.currentTarget);
    form.delete("categories");
    cats.forEach((c) => form.append("categories", c));
    const r = await fetch("/api/admin/news", { method: "POST", body: form });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setMsg({ ok: true, text: "お知らせを追加しました ✓" });
      (e.target as HTMLFormElement).reset();
      setCats([]);
    } else {
      setMsg({ ok: false, text: d.error || "保存に失敗しました" });
    }
    setBusy(false);
  }

  return (
    <AdminChrome title="お知らせを追加">
      <form onSubmit={submit} style={card}>
        <label style={label}>タイトル <span style={{ color: "#EE651C" }}>*</span></label>
        <input name="title" required placeholder="例：ROUND.7 結果のお知らせ" style={input} />

        <label style={label}>公開日</label>
        <input name="publishedDate" type="date" defaultValue={today()} style={input} />

        <label style={label}>カテゴリ（複数選択可）</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NEWS_CATEGORIES.map((c) => (
            <button type="button" key={c} onClick={() => toggle(c)}
              style={{ padding: "7px 12px", borderRadius: 999, fontSize: 13, cursor: "pointer", border: "1px solid", borderColor: cats.includes(c) ? "#EE651C" : "#ccc", background: cats.includes(c) ? "#EE651C" : "#fff", color: cats.includes(c) ? "#fff" : "#444" }}>
              {c}
            </button>
          ))}
        </div>

        <label style={label}>サムネイル画像（任意・16:9推奨）</label>
        <input name="thumbnail" type="file" accept="image/*" style={{ ...input, padding: 9 }} />

        <label style={label}>本文</label>
        <textarea name="body" rows={7} placeholder="本文を入力…" style={{ ...input, resize: "vertical", lineHeight: 1.7 }} />

        {msg && <p style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: msg.ok ? "#1a8f3c" : "#d11" }}>{msg.text}</p>}
        <button type="submit" disabled={busy} style={{ marginTop: 20, padding: "13px 28px", fontSize: 15, fontWeight: 800, color: "#fff", background: busy ? "#f0a877" : "#EE651C", border: "none", borderRadius: 10, cursor: "pointer" }}>
          {busy ? "保存中…" : "追加する"}
        </button>
      </form>
    </AdminChrome>
  );
}
