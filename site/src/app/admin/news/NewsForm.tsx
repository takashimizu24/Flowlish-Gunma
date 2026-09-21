"use client";

import { useState } from "react";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { NEWS_CATEGORIES } from "@/lib/adminOptions";
import type { News } from "@/lib/types";

type NewsListItem = { id: string; title: string; publishedDate: string };

const label: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: 13, margin: "18px 0 6px" };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "11px 12px", fontSize: 15, border: "1px solid #d8d8d8", borderRadius: 9, background: "#fff" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "8px 24px 24px", boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)" };

const today = () => new Date().toISOString().slice(0, 10);

export default function NewsForm({ news, editing }: { news: NewsListItem[]; editing: News | null }) {
  const [cats, setCats] = useState<string[]>(() => editing?.categories ?? []);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dateVal = editing?.publishedDate ? new Date(editing.publishedDate).toISOString().slice(0, 10) : today();

  const toggle = (c: string) => setCats((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const form = new FormData(e.currentTarget);
    if (editing) form.set("id", editing.id);
    form.delete("categories");
    cats.forEach((c) => form.append("categories", c));
    const r = await fetch("/api/admin/news", { method: "POST", body: form });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setMsg({ ok: true, text: editing ? "お知らせを更新しました ✓" : "お知らせを追加しました ✓" });
      if (!editing) {
        (e.target as HTMLFormElement).reset();
        setCats([]);
      }
    } else {
      setMsg({ ok: false, text: d.error || "保存に失敗しました" });
    }
    setBusy(false);
  }

  return (
    <AdminChrome title={editing ? "お知らせを編集" : "お知らせを追加"}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", marginBottom: 16, boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>既存のお知らせを編集</span>
          <a href="/admin/news" style={{ fontSize: 12, fontWeight: 700, color: editing ? "#EE651C" : "#aaa", textDecoration: "none" }}>＋ 新規作成</a>
        </div>
        {news.length === 0 ? (
          <p style={{ fontSize: 12, color: "#999", margin: 0 }}>まだお知らせがありません。</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflow: "auto" }}>
            {news.map((n) => (
              <a key={n.id} href={`/admin/news?id=${n.id}`}
                style={{ fontSize: 12.5, padding: "7px 10px", borderRadius: 7, textDecoration: "none", border: "1px solid", borderColor: editing?.id === n.id ? "#EE651C" : "#eee", background: editing?.id === n.id ? "#EE651C" : "#fafafa", color: editing?.id === n.id ? "#fff" : "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {n.publishedDate ? `${n.publishedDate.slice(0, 10)}　` : ""}{n.title}
              </a>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} style={card}>
        <label style={label}>タイトル <span style={{ color: "#EE651C" }}>*</span></label>
        <input name="title" required defaultValue={editing?.title ?? ""} placeholder="例：ROUND.7 結果のお知らせ" style={input} />

        <label style={label}>公開日</label>
        <input name="publishedDate" type="date" defaultValue={dateVal} style={input} />

        <label style={label}>カテゴリ（複数選択可）</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NEWS_CATEGORIES.map((c) => (
            <button type="button" key={c} onClick={() => toggle(c)}
              style={{ padding: "7px 12px", borderRadius: 999, fontSize: 13, cursor: "pointer", border: "1px solid", borderColor: cats.includes(c) ? "#EE651C" : "#ccc", background: cats.includes(c) ? "#EE651C" : "#fff", color: cats.includes(c) ? "#fff" : "#444" }}>
              {c}
            </button>
          ))}
        </div>

        <label style={label}>サムネイル画像（{editing?.thumbnail ? "変更する場合のみ選択" : "任意・16:9推奨"}）</label>
        {editing?.thumbnail && <img src={`${editing.thumbnail.url}?w=240`} alt="" style={{ width: 160, aspectRatio: "16/9", objectFit: "cover", borderRadius: 8, display: "block", marginBottom: 8 }} />}
        <input name="thumbnail" type="file" accept="image/*" style={{ ...input, padding: 9 }} />

        <label style={label}>本文</label>
        <textarea name="body" rows={7} defaultValue={editing?.body ?? ""} placeholder="本文を入力…" style={{ ...input, resize: "vertical", lineHeight: 1.7 }} />

        {msg && <p style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: msg.ok ? "#1a8f3c" : "#d11" }}>{msg.text}</p>}
        <button type="submit" disabled={busy} style={{ marginTop: 20, padding: "13px 28px", fontSize: 15, fontWeight: 800, color: "#fff", background: busy ? "#f0a877" : "#EE651C", border: "none", borderRadius: 10, cursor: "pointer" }}>
          {busy ? "保存中…" : editing ? "更新する" : "追加する"}
        </button>
      </form>
    </AdminChrome>
  );
}
