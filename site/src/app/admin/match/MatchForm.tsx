"use client";

import { useState } from "react";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { MATCH_STATUS, RESULT_BADGES, GAME_PHASES } from "@/lib/adminOptions";

type PlayerOpt = { id: string; number: number; nameEn: string };
type Game = { phase: string; opp: string; myScore: string; oppScore: string };

const label: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: 13, margin: "18px 0 6px" };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "11px 12px", fontSize: 15, border: "1px solid #d8d8d8", borderRadius: 9, background: "#fff" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "8px 24px 24px", boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)" };
const half: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };

export default function MatchForm({ players }: { players: PlayerOpt[] }) {
  const [entry, setEntry] = useState<string[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function toggleEntry(id: string) {
    setEntry((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  }
  function addGame() {
    setGames((g) => [...g, { phase: "", opp: "", myScore: "", oppScore: "" }]);
  }
  function updGame(i: number, patch: Partial<Game>) {
    setGames((g) => g.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  }
  function delGame(i: number) {
    setGames((g) => g.filter((_, k) => k !== i));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const f = new FormData(e.currentTarget);
    const body = {
      league: f.get("league"),
      round: f.get("round"),
      date: f.get("date"),
      dateLabel: f.get("dateLabel"),
      venue: f.get("venue"),
      status: f.get("status"),
      resultBadge: f.get("resultBadge"),
      memo: f.get("memo"),
      eventUrl: f.get("eventUrl"),
      fibaEventUrl: f.get("fibaEventUrl"),
      liveUrl: f.get("liveUrl"),
      entryPlayers: entry,
      games,
    };
    const r = await fetch("/api/admin/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setMsg({ ok: true, text: "試合を追加しました ✓" });
      (e.target as HTMLFormElement).reset();
      setEntry([]);
      setGames([]);
    } else {
      setMsg({ ok: false, text: d.error || "保存に失敗しました" });
    }
    setBusy(false);
  }

  const winHint = (g: Game) => {
    const a = Number(g.myScore), b = Number(g.oppScore);
    if (!g.myScore || !g.oppScore || !Number.isFinite(a) || !Number.isFinite(b)) return "";
    return a > b ? "WIN" : "LOSE";
  };

  return (
    <AdminChrome title="試合を追加">
      <form onSubmit={submit} style={card}>
        <div style={half}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={label}>リーグ</label>
            <input name="league" defaultValue="3x3.EXE PREMIER" style={input} />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={label}>ラウンド <span style={{ color: "#EE651C" }}>*</span></label>
            <input name="round" required placeholder="ROUND.8" style={input} />
          </div>
        </div>

        <div style={half}>
          <div style={{ flex: "1 1 160px" }}>
            <label style={label}>開催日</label>
            <input name="date" type="date" style={input} />
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label style={label}>日付表示（空欄なら自動）</label>
            <input name="dateLabel" placeholder="例：2026.6.13-14" style={input} />
          </div>
        </div>

        <label style={label}>会場</label>
        <input name="venue" placeholder="例：ビエント高崎（群馬県高崎市）" style={input} />

        <div style={half}>
          <div style={{ flex: "1 1 160px" }}>
            <label style={label}>状態</label>
            <select name="status" defaultValue="結果" style={input}>
              {MATCH_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label style={label}>最終順位</label>
            <input name="resultBadge" list="badges" placeholder="優勝 / 6位 など" style={input} />
            <datalist id="badges">{RESULT_BADGES.map((b) => <option key={b} value={b} />)}</datalist>
          </div>
        </div>

        <label style={label}>出場選手（クリックで選択）</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {players.map((p) => (
            <button type="button" key={p.id} onClick={() => toggleEntry(p.id)}
              style={{ padding: "7px 12px", borderRadius: 999, fontSize: 13, cursor: "pointer", border: "1px solid", borderColor: entry.includes(p.id) ? "#EE651C" : "#ccc", background: entry.includes(p.id) ? "#EE651C" : "#fff", color: entry.includes(p.id) ? "#fff" : "#444" }}>
              #{p.number} {p.nameEn}
            </button>
          ))}
        </div>

        <label style={label}>試合スコア（勝敗は自動）</label>
        {games.map((g, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8, background: "#faf9f7", padding: 10, borderRadius: 10 }}>
            <input value={g.phase} onChange={(e) => updGame(i, { phase: e.target.value })} list="phases" placeholder="フェーズ" style={{ ...input, flex: "1 1 100px", padding: "8px 10px" }} />
            <datalist id="phases">{GAME_PHASES.map((p) => <option key={p} value={p} />)}</datalist>
            <input value={g.opp} onChange={(e) => updGame(i, { opp: e.target.value })} placeholder="対戦相手" style={{ ...input, flex: "2 1 160px", padding: "8px 10px" }} />
            <input value={g.myScore} onChange={(e) => updGame(i, { myScore: e.target.value })} type="number" placeholder="自" style={{ ...input, width: 60, flex: "none", padding: "8px 8px" }} />
            <span style={{ color: "#999" }}>-</span>
            <input value={g.oppScore} onChange={(e) => updGame(i, { oppScore: e.target.value })} type="number" placeholder="相手" style={{ ...input, width: 60, flex: "none", padding: "8px 8px" }} />
            <span style={{ width: 44, textAlign: "center", fontWeight: 800, fontSize: 12, color: winHint(g) === "WIN" ? "#EE651C" : winHint(g) === "LOSE" ? "#999" : "transparent" }}>{winHint(g) || "—"}</span>
            <button type="button" onClick={() => delGame(i)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#c33", cursor: "pointer", fontSize: 13 }}>削除</button>
          </div>
        ))}
        <button type="button" onClick={addGame} style={{ marginTop: 4, padding: "9px 16px", fontSize: 13, fontWeight: 700, color: "#EE651C", background: "#fff", border: "1px dashed #EE651C", borderRadius: 9, cursor: "pointer" }}>＋ 試合を追加</button>

        <label style={label}>備考（任意・イレギュラーな情報など）</label>
        <textarea name="memo" rows={2} placeholder="例：会場変更 / 悪天候により順延 など" style={{ ...input, resize: "vertical", lineHeight: 1.6 }} />

        <label style={label}>大会公式サイト URL（任意）</label>
        <input name="eventUrl" type="url" placeholder="https://…（大会・イベントのHP）" style={input} />

        <label style={label}>FIBA 3x3 イベントページ URL（任意）</label>
        <input name="fibaEventUrl" type="url" placeholder="https://play.fiba3x3.com/events/…" style={input} />

        <label style={label}>ライブ配信 URL（任意）</label>
        <input name="liveUrl" type="url" placeholder="https://youtube.com/… など" style={input} />

        <div>
          {msg && <p style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: msg.ok ? "#1a8f3c" : "#d11" }}>{msg.text}</p>}
          <button type="submit" disabled={busy} style={{ marginTop: 20, padding: "13px 28px", fontSize: 15, fontWeight: 800, color: "#fff", background: busy ? "#f0a877" : "#EE651C", border: "none", borderRadius: 10, cursor: "pointer" }}>
            {busy ? "保存中…" : "追加する"}
          </button>
        </div>
      </form>
    </AdminChrome>
  );
}
