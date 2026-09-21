"use client";

import { useState } from "react";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { PLAYER_POSITIONS, NATIONALITIES } from "@/lib/adminOptions";
import type { Player } from "@/lib/types";

type PlayerListItem = { id: string; nameJa: string; number: number; active: boolean };

const label: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: 13, margin: "18px 0 6px" };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "11px 12px", fontSize: 15, border: "1px solid #d8d8d8", borderRadius: 9, background: "#fff" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "8px 24px 24px", boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)" };
const half: React.CSSProperties = { display: "flex", gap: 14, flexWrap: "wrap" };
const col: React.CSSProperties = { flex: "1 1 160px", minWidth: 0 };

// Birthdays are stored as JST midnight; format the stored instant in JST for the date input.
const bdVal = (s?: string) => (s ? new Date(new Date(s).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10) : "");

export default function PlayerForm({ players, editing }: { players: PlayerListItem[]; editing: Player | null }) {
  const [active, setActive] = useState<boolean>(() => editing?.active !== false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const form = new FormData(e.currentTarget);
    if (editing) form.set("id", editing.id);
    const r = await fetch("/api/admin/players", { method: "POST", body: form });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setMsg({ ok: true, text: editing ? "選手を更新しました ✓" : "選手を追加しました ✓" });
      if (!editing) { (e.target as HTMLFormElement).reset(); setActive(true); }
    } else {
      setMsg({ ok: false, text: d.error || "保存に失敗しました" });
    }
    setBusy(false);
  }

  const current = players.filter((p) => p.active);
  const former = players.filter((p) => !p.active);

  return (
    <AdminChrome title={editing ? "選手を編集" : "選手を追加"}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", marginBottom: 16, boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>既存の選手を編集</span>
          <a href="/admin/players" style={{ fontSize: 12, fontWeight: 700, color: editing ? "#EE651C" : "#aaa", textDecoration: "none" }}>＋ 新規追加</a>
        </div>
        {players.length === 0 ? (
          <p style={{ fontSize: 12, color: "#999", margin: 0 }}>まだ選手がいません。</p>
        ) : (
          <div style={{ maxHeight: 220, overflow: "auto" }}>
            {[{ t: "現役", list: current }, { t: "過去の選手", list: former }].map(({ t, list }) =>
              list.length === 0 ? null : (
                <div key={t} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#aaa", margin: "6px 0 4px", letterSpacing: ".08em" }}>{t}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {list.map((p) => (
                      <a key={p.id} href={`/admin/players?id=${p.id}`}
                        style={{ fontSize: 12.5, padding: "6px 10px", borderRadius: 7, textDecoration: "none", border: "1px solid", borderColor: editing?.id === p.id ? "#EE651C" : "#eee", background: editing?.id === p.id ? "#EE651C" : "#fafafa", color: editing?.id === p.id ? "#fff" : "#444" }}>
                        #{p.number}　{p.nameJa}
                      </a>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <form onSubmit={submit} style={card}>
        <div style={half}>
          <div style={col}>
            <label style={label}>選手名（日本語）<span style={{ color: "#EE651C" }}>*</span></label>
            <input name="nameJa" required defaultValue={editing?.nameJa ?? ""} placeholder="例：横井 美沙" style={input} />
          </div>
          <div style={col}>
            <label style={label}>選手名（英語）</label>
            <input name="nameEn" defaultValue={editing?.nameEn ?? ""} placeholder="例：MISA YOKOI" style={input} />
          </div>
        </div>

        <div style={half}>
          <div style={col}>
            <label style={label}>背番号</label>
            <input name="number" type="number" inputMode="numeric" defaultValue={editing?.number ?? ""} placeholder="7" style={input} />
          </div>
          <div style={col}>
            <label style={label}>ポジション</label>
            <input name="position" list="positions" defaultValue={editing?.position ?? ""} placeholder="Guard" style={input} />
            <datalist id="positions">{PLAYER_POSITIONS.map((p) => <option key={p} value={p} />)}</datalist>
          </div>
          <div style={col}>
            <label style={label}>身長(cm)</label>
            <input name="height" defaultValue={editing?.height ?? ""} placeholder="170" style={input} />
          </div>
        </div>

        <div style={half}>
          <div style={col}>
            <label style={label}>出身</label>
            <input name="hometown" defaultValue={editing?.hometown ?? ""} placeholder="例：長野県上田市" style={input} />
          </div>
          <div style={col}>
            <label style={label}>国籍</label>
            <input name="nationality" list="nats" defaultValue={editing?.nationality ?? ""} placeholder="Japan" style={input} />
            <datalist id="nats">{NATIONALITIES.map((n) => <option key={n} value={n} />)}</datalist>
          </div>
          <div style={col}>
            <label style={label}>生年月日</label>
            <input name="birthdate" type="date" defaultValue={bdVal(editing?.birthdate)} style={input} />
          </div>
        </div>

        <label style={label}>プロフィール / 経歴</label>
        <textarea name="bio" rows={3} defaultValue={editing?.bio ?? ""} placeholder="任意" style={{ ...input, resize: "vertical", lineHeight: 1.7 }} />

        <div style={half}>
          <div style={col}>
            <label style={label}>Instagram URL</label>
            <input name="snsInstagram" defaultValue={editing?.snsInstagram ?? ""} placeholder="https://www.instagram.com/..." style={input} />
          </div>
          <div style={col}>
            <label style={label}>X URL</label>
            <input name="snsX" defaultValue={editing?.snsX ?? ""} placeholder="https://x.com/..." style={input} />
          </div>
        </div>
        <label style={label}>FIBA 3x3 個人ページ URL</label>
        <input name="fibaUrl" defaultValue={editing?.fibaUrl ?? ""} placeholder="https://play.fiba3x3.com/players/..." style={input} />

        <div style={half}>
          <div style={col}>
            <label style={label}>ロースター写真（3:4／{editing?.photo ? "変更時のみ" : "任意"}）</label>
            {editing?.photo && <img src={`${editing.photo.url}?w=140`} alt="" style={{ width: 96, aspectRatio: "3/4", objectFit: "cover", borderRadius: 8, display: "block", marginBottom: 8 }} />}
            <input name="photo" type="file" accept="image/*" style={{ ...input, padding: 9 }} />
          </div>
          <div style={col}>
            <label style={label}>モーダル用ポートレート（縦／{editing?.photoDetail ? "変更時のみ" : "任意"}）</label>
            {editing?.photoDetail && <img src={`${editing.photoDetail.url}?w=140`} alt="" style={{ width: 96, aspectRatio: "3/4", objectFit: "cover", borderRadius: 8, display: "block", marginBottom: 8 }} />}
            <input name="photoDetail" type="file" accept="image/*" style={{ ...input, padding: 9 }} />
          </div>
        </div>

        <div style={half}>
          <div style={col}>
            <label style={label}>表示順（order・小さいほど先）</label>
            <input name="order" type="number" inputMode="numeric" defaultValue={(editing as { order?: number } | null)?.order ?? ""} placeholder="1" style={input} />
          </div>
          <div style={{ ...col, display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              <input type="checkbox" name="active" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ width: 20, height: 20 }} />
              現役ロースターに表示（オフ＝過去の選手）
            </label>
          </div>
        </div>

        {msg && <p style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: msg.ok ? "#1a8f3c" : "#d11" }}>{msg.text}</p>}
        <button type="submit" disabled={busy} style={{ marginTop: 20, padding: "13px 28px", fontSize: 15, fontWeight: 800, color: "#fff", background: busy ? "#f0a877" : "#EE651C", border: "none", borderRadius: 10, cursor: "pointer" }}>
          {busy ? "保存中…" : editing ? "更新する" : "追加する"}
        </button>
      </form>
    </AdminChrome>
  );
}
