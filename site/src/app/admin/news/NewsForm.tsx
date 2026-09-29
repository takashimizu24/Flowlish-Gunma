"use client";

import { useState } from "react";
import { AdminChrome } from "@/components/admin/AdminChrome";
import RichEditor from "@/components/admin/RichEditor";
import { Section, Field, Chip, PickList, PickRow, SaveBar, inputStyle as input } from "@/components/admin/ui";
import { NEWS_CATEGORIES } from "@/lib/adminOptions";
import type { News } from "@/lib/types";

type NewsListItem = { id: string; title: string; publishedDate: string };

const today = () => new Date().toISOString().slice(0, 10);

export default function NewsForm({ news, editing }: { news: NewsListItem[]; editing: News | null }) {
  const [cats, setCats] = useState<string[]>(() => editing?.categories ?? []);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function remove() {
    if (!editing) return;
    if (!confirm(`このお知らせを削除します。よろしいですか？\n\n「${editing.title}」`)) return;
    setBusy(true);
    setMsg(null);
    const r = await fetch(`/api/admin/news?id=${editing.id}`, { method: "DELETE" });
    if (r.ok) {
      location.href = "/admin/news";
    } else {
      const d = await r.json().catch(() => ({}));
      setMsg({ ok: false, text: d.error || "削除に失敗しました" });
      setBusy(false);
    }
  }

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
      <PickList title={`既存のお知らせから選んで編集${editing ? "中" : ""}`} count={news.length} newHref="/admin/news" newLabel="新規作成" editing={!!editing}>
        {news.length === 0 ? (
          <p style={{ fontSize: 13, color: "#999", margin: 0 }}>まだお知らせがありません。</p>
        ) : (
          news.map((n) => (
            <PickRow key={n.id} href={`/admin/news?id=${n.id}`} active={editing?.id === n.id}>
              <span style={{ flex: "none", opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>{n.publishedDate.slice(0, 10)}</span>
              <span style={{ flex: "1 1 auto", minWidth: 0, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
            </PickRow>
          ))
        )}
      </PickList>

      <form onSubmit={submit}>
        <Section title="基本情報">
          <Field label="タイトル" required>
            <input name="title" required defaultValue={editing?.title ?? ""} placeholder="例：ROUND.7 結果のお知らせ" style={input} />
          </Field>
          <Field label="公開日" hint="ニュース一覧はこの日付の新しい順に並びます。">
            <input name="publishedDate" type="date" defaultValue={dateVal} style={{ ...input, maxWidth: 280 }} />
          </Field>
          <Field label="カテゴリ" hint="複数選べます。タップで選択／解除。">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {NEWS_CATEGORIES.map((c) => (
                <Chip key={c} on={cats.includes(c)} onClick={() => toggle(c)}>{c}</Chip>
              ))}
            </div>
          </Field>
        </Section>

        <Section title="サムネイル画像" desc="ニュース一覧とトップのカードに表示されます。横長 16:9 の画像がおすすめです。">
          <Field label={editing?.thumbnail ? "画像を変更" : "画像"} hint={editing?.thumbnail ? "変更するときだけ選んでください。選ばなければ今の画像のままです。" : undefined}>
            {editing?.thumbnail && <img src={`${editing.thumbnail.url}?w=480`} alt="" style={{ width: "100%", maxWidth: 320, aspectRatio: "16/9", objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 10 }} />}
            <input name="thumbnail" type="file" accept="image/*" style={{ ...input, padding: 10 }} />
          </Field>
        </Section>

        <Section title="本文" desc="ツールバーで太字・見出し・リスト・リンク・画像を入れられます。">
          <div style={{ marginTop: 16 }}>
            <RichEditor name="body" defaultValue={editing?.body ?? ""} />
          </div>
        </Section>

        <SaveBar busy={busy} editing={!!editing} msg={msg}
          extra={editing && (
            <button type="button" onClick={remove} disabled={busy} style={{ padding: "13px 20px", fontSize: 14, fontWeight: 700, color: "#c0392b", background: "#fff", border: "1.5px solid #e0b4ae", borderRadius: 10, cursor: "pointer" }}>
              削除する
            </button>
          )}
        />
      </form>
    </AdminChrome>
  );
}
