"use client";

import { useState } from "react";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { MATCH_STATUS, RESULT_BADGES, GAME_PHASES } from "@/lib/adminOptions";
import { gameOutcome, isWin, isWalkover, OUTCOME_LABEL } from "@/lib/result";
import type { Match } from "@/lib/types";

type PlayerOpt = { id: string; number: number; nameEn: string };
type MatchListItem = { id: string; round: string; dateLabel: string };
type Walkover = "" | "win" | "lose";
type Game = { phase: string; opp: string; myScore: string; oppScore: string; walkover: Walkover };

const label: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: 13, margin: "18px 0 6px" };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "11px 12px", fontSize: 15, border: "1px solid #d8d8d8", borderRadius: 9, background: "#fff" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "8px 24px 24px", boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)" };
const half: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };

function gamesFromScores(scores?: string): Game[] {
  try {
    const v = JSON.parse(scores || "");
    return (v.games || []).map((g: { phase?: string; opp?: string; score?: string; result?: string }) => {
      const outcome = gameOutcome(g);
      // Walkovers carry no points ("W-0"), so the score boxes stay empty.
      const walkover: Walkover = outcome === "wo-win" ? "win" : outcome === "wo-lose" ? "lose" : "";
      const [my, opp] = String(g.score ?? "").split("-");
      return {
        phase: g.phase || "",
        opp: g.opp || "",
        myScore: walkover ? "" : my || "",
        oppScore: walkover ? "" : opp || "",
        walkover,
      };
    });
  } catch {
    return [];
  }
}

export default function MatchForm({ players, matches, editing }: { players: PlayerOpt[]; matches: MatchListItem[]; editing: Match | null }) {
  const [entry, setEntry] = useState<string[]>(() => (editing?.entryPlayers ?? []).map((p) => p.id));
  const [games, setGames] = useState<Game[]>(() => gamesFromScores(editing?.scores));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dateVal = editing?.date ? new Date(editing.date).toISOString().slice(0, 10) : "";

  function toggleEntry(id: string) {
    setEntry((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  }
  const addGame = () => setGames((g) => [...g, { phase: "", opp: "", myScore: "", oppScore: "", walkover: "" }]);
  const updGame = (i: number, patch: Partial<Game>) => setGames((g) => g.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const delGame = (i: number) => setGames((g) => g.filter((_, k) => k !== i));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const f = new FormData(e.currentTarget);
    const body = {
      id: editing?.id,
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
    const r = await fetch("/api/admin/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setMsg({ ok: true, text: editing ? "試合を更新しました ✓" : "試合を追加しました ✓" });
      if (!editing) {
        (e.target as HTMLFormElement).reset();
        setEntry([]);
        setGames([]);
      }
    } else {
      setMsg({ ok: false, text: d.error || "保存に失敗しました" });
    }
    setBusy(false);
  }

  // Preview of what the site will show for this game (blank while undecided).
  const hint = (g: Game) => {
    const outcome =
      g.walkover === "win" ? ("wo-win" as const)
      : g.walkover === "lose" ? ("wo-lose" as const)
      : !g.myScore || !g.oppScore ? ("" as const)
      : gameOutcome({ score: `${g.myScore}-${g.oppScore}` });
    return outcome ? { text: OUTCOME_LABEL[outcome], win: isWin(outcome), wo: isWalkover(outcome) } : null;
  };

  return (
    <AdminChrome title={editing ? "試合を編集" : "試合を追加"}>
      {/* existing matches to edit */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", marginBottom: 16, boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>既存の試合を編集</span>
          <a href="/admin/match" style={{ fontSize: 12, fontWeight: 700, color: editing ? "#EE651C" : "#aaa", textDecoration: "none" }}>＋ 新規作成</a>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 132, overflow: "auto" }}>
          {matches.map((m) => (
            <a key={m.id} href={`/admin/match?id=${m.id}`}
              style={{ fontSize: 12, padding: "5px 10px", borderRadius: 7, textDecoration: "none", border: "1px solid", borderColor: editing?.id === m.id ? "#EE651C" : "#e2e2e2", background: editing?.id === m.id ? "#EE651C" : "#fafafa", color: editing?.id === m.id ? "#fff" : "#444" }}>
              {m.round}{m.dateLabel ? ` (${m.dateLabel})` : ""}
            </a>
          ))}
        </div>
      </div>

      <form onSubmit={submit} style={card}>
        <div style={half}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={label}>リーグ</label>
            <input name="league" defaultValue={editing?.league ?? "3x3.EXE PREMIER"} style={input} />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={label}>ラウンド <span style={{ color: "#EE651C" }}>*</span></label>
            <input name="round" required defaultValue={editing?.round ?? ""} placeholder="ROUND.8" style={input} />
          </div>
        </div>

        <div style={half}>
          <div style={{ flex: "1 1 160px" }}>
            <label style={label}>開催日</label>
            <input name="date" type="date" defaultValue={dateVal} style={input} />
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label style={label}>日付表示（空欄なら自動）</label>
            <input name="dateLabel" defaultValue={editing?.dateLabel ?? ""} placeholder="例：2026.6.13-14" style={input} />
          </div>
        </div>

        <label style={label}>会場</label>
        <input name="venue" defaultValue={editing?.venue ?? ""} placeholder="例：ビエント高崎（群馬県高崎市）" style={input} />

        <div style={half}>
          <div style={{ flex: "1 1 160px" }}>
            <label style={label}>状態</label>
            <select name="status" defaultValue={editing?.status ?? "結果"} style={input}>
              {MATCH_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label style={label}>最終順位</label>
            <input name="resultBadge" defaultValue={editing?.resultBadge ?? ""} list="badges" placeholder="優勝 / 6位 など" style={input} />
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

        <label style={label}>試合スコア（勝敗は自動／不戦勝・不戦敗はスコア入力不要）</label>
        {games.map((g, i) => {
          const h = hint(g);
          const wo = g.walkover !== "";
          const scoreBox: React.CSSProperties = { ...input, width: 60, flex: "none", padding: "8px 8px", background: wo ? "#f0efec" : "#fff", color: wo ? "#bbb" : undefined };
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8, background: "#faf9f7", padding: 10, borderRadius: 10 }}>
              <input value={g.phase} onChange={(e) => updGame(i, { phase: e.target.value })} list="phases" placeholder="フェーズ" style={{ ...input, flex: "1 1 100px", padding: "8px 10px" }} />
              <datalist id="phases">{GAME_PHASES.map((p) => <option key={p} value={p} />)}</datalist>
              <input value={g.opp} onChange={(e) => updGame(i, { opp: e.target.value })} placeholder="対戦相手" style={{ ...input, flex: "2 1 160px", padding: "8px 10px" }} />
              <select
                value={g.walkover}
                onChange={(e) => updGame(i, { walkover: e.target.value as Walkover, ...(e.target.value ? { myScore: "", oppScore: "" } : {}) })}
                style={{ ...input, flex: "0 1 120px", padding: "8px 8px" }}
              >
                <option value="">スコア入力</option>
                <option value="win">不戦勝</option>
                <option value="lose">不戦敗</option>
              </select>
              <input value={g.myScore} onChange={(e) => updGame(i, { myScore: e.target.value })} type="number" placeholder={wo ? "—" : "自"} disabled={wo} style={scoreBox} />
              <span style={{ color: "#999" }}>-</span>
              <input value={g.oppScore} onChange={(e) => updGame(i, { oppScore: e.target.value })} type="number" placeholder={wo ? "—" : "相手"} disabled={wo} style={scoreBox} />
              <span style={{ width: 44, textAlign: "center", fontWeight: 800, fontSize: h?.wo ? 11 : 12, color: h ? (h.win ? "#EE651C" : "#999") : "#ddd" }}>{h ? h.text : "—"}</span>
              <button type="button" onClick={() => delGame(i)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#c33", cursor: "pointer", fontSize: 13 }}>削除</button>
            </div>
          );
        })}
        <button type="button" onClick={addGame} style={{ marginTop: 4, padding: "9px 16px", fontSize: 13, fontWeight: 700, color: "#EE651C", background: "#fff", border: "1px dashed #EE651C", borderRadius: 9, cursor: "pointer" }}>＋ 試合を追加</button>

        <label style={label}>備考（任意・イレギュラーな情報など）</label>
        <textarea name="memo" defaultValue={editing?.memo ?? ""} rows={2} placeholder="例：会場変更 / 悪天候により順延 など" style={{ ...input, resize: "vertical", lineHeight: 1.6 }} />

        <label style={label}>大会公式サイト URL（任意）</label>
        <input name="eventUrl" type="url" defaultValue={editing?.eventUrl ?? ""} placeholder="https://…（大会・イベントのHP）" style={input} />

        <label style={label}>FIBA 3x3 イベントページ URL（任意）</label>
        <input name="fibaEventUrl" type="url" defaultValue={editing?.fibaEventUrl ?? ""} placeholder="https://play.fiba3x3.com/events/…" style={input} />

        <label style={label}>ライブ配信 URL（任意）</label>
        <input name="liveUrl" type="url" defaultValue={editing?.liveUrl ?? ""} placeholder="https://youtube.com/… など" style={input} />

        <div>
          {msg && <p style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: msg.ok ? "#1a8f3c" : "#d11" }}>{msg.text}</p>}
          <button type="submit" disabled={busy} style={{ marginTop: 20, padding: "13px 28px", fontSize: 15, fontWeight: 800, color: "#fff", background: busy ? "#f0a877" : "#EE651C", border: "none", borderRadius: 10, cursor: "pointer" }}>
            {busy ? "保存中…" : editing ? "更新する" : "追加する"}
          </button>
        </div>
      </form>
    </AdminChrome>
  );
}
