"use client";

import { useState } from "react";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { Section, Field, Chip, PickList, PickRow, PickHeading, SaveBar, inputStyle as input, ORANGE } from "@/components/admin/ui";
import { MATCH_STATUS, RESULT_BADGES, GAME_PHASES } from "@/lib/adminOptions";
import { roundTitle, seasonOf, seasonStart, currentSeason, seasonForDate, titleSlots, serializeTitleOrder, partText, leagueLabel, type TitleSlot, type TitlePart, type LabelFields } from "@/lib/match";
import { COUNTRY_GROUPS, flagEmoji } from "@/lib/countries";
import type { Match } from "@/lib/types";

// override choices: 2022-23 .. next season, newest first
const SEASON_OPTS = Array.from({ length: seasonStart(currentSeason()) + 2 - 2022 }, (_, i) => seasonOf(seasonStart(currentSeason()) + 1 - i));

type PlayerOpt = { id: string; number: number; nameEn: string; active: boolean };
type MatchListItem = { id: string; league: string; year?: number; season: string; round: string; dateLabel: string; date: string };

const ymdShort = (d: string, label: string) => label || (d ? new Date(d).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" }) : "");
type Game = { phase: string; opp: string; myScore: string; oppScore: string; wo: "" | "win" | "lose"; country: string };

const small: React.CSSProperties = { ...input, padding: "10px 12px" };

function gamesFromScores(scores?: string): Game[] {
  try {
    const v = JSON.parse(scores || "");
    return (v.games || []).map((g: { phase?: string; opp?: string; score?: string; result?: string; country?: string }) => {
      const r = String(g.result ?? "").toLowerCase();
      const wo: Game["wo"] = r === "wo-win" || g.result === "不戦勝" ? "win" : r === "wo-lose" || g.result === "不戦敗" ? "lose" : "";
      const [my, opp] = String(g.score ?? "").split("-");
      return { phase: g.phase || "", opp: g.opp || "", myScore: wo ? "" : my || "", oppScore: wo ? "" : opp || "", wo, country: g.country || "" };
    });
  } catch {
    return [];
  }
}

const PART_NAMES: Record<TitlePart, string> = { sponsor: "冠スポンサー", league: "リーグ", extra: "その他", year: "年", season: "シーズン" };

/** Order + visibility of the league-line parts, with a live preview of the line. */
function TitleOrderEditor({ slots, onChange, m }: { slots: TitleSlot[]; onChange: (s: TitleSlot[]) => void; m: LabelFields }) {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= slots.length) return;
    const next = [...slots];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const toggle = (i: number) => onChange(slots.map((x, k) => (k === i ? { ...x, on: !x.on } : x)));
  const preview = leagueLabel({ ...m, titleOrder: serializeTitleOrder(slots) });
  const btn: React.CSSProperties = { width: 38, height: 38, border: "1px solid #d6d6d6", borderRadius: 8, background: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", flex: "none" };
  return (
    <div>
      <div style={{ background: "#141414", color: ORANGE, borderRadius: 10, padding: "12px 14px", fontWeight: 800, fontSize: 15, letterSpacing: ".02em", minHeight: 20 }}>
        {preview || <span style={{ color: "#777", fontWeight: 600 }}>（表示なし）</span>}
      </div>
      <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
        {slots.map((x, i) => {
          const text = partText(m, x.part);
          return (
            <div key={x.part} style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #e4e4e4", borderRadius: 10, padding: "6px 8px 6px 12px", background: x.on ? "#fff" : "#f6f6f6" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 auto", minWidth: 0, cursor: "pointer" }}>
                <input type="checkbox" checked={x.on} onChange={() => toggle(i)} style={{ width: 20, height: 20, accentColor: ORANGE, flex: "none" }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: x.on ? ORANGE : "#aaa", borderRadius: 999, padding: "3px 9px", flex: "none" }}>{PART_NAMES[x.part]}</span>
                <span style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: x.on && text ? 1 : 0.45 }}>{text || "（未入力）"}</span>
              </label>
              <button type="button" aria-label="上へ" onClick={() => move(i, -1)} disabled={i === 0} style={{ ...btn, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
              <button type="button" aria-label="下へ" onClick={() => move(i, 1)} disabled={i === slots.length - 1} style={{ ...btn, opacity: i === slots.length - 1 ? 0.3 : 1 }}>↓</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MatchForm({ players, matches, leagues, sponsors, oppCountries, editing }: {
  players: PlayerOpt[]; matches: MatchListItem[]; leagues: string[]; sponsors: string[]; oppCountries: Record<string, string>; editing: Match | null;
}) {
  const [entry, setEntry] = useState<string[]>(() => (editing?.entryPlayers ?? []).map((p) => p.id));
  const [games, setGames] = useState<Game[]>(() => gamesFromScores(editing?.scores));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const current = players.filter((p) => p.active);
  const former = players.filter((p) => !p.active);
  const [showFormer, setShowFormer] = useState(() => former.some((p) => entry.includes(p.id)));

  // show the date input in JST so it round-trips without a day shift
  const dateVal = editing?.date ? new Date(new Date(editing.date).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10) : "";
  // live date -> the season "自動" resolves to (shown in the season select)
  const [dateIn, setDateIn] = useState(dateVal);
  const autoSeason = dateIn ? seasonForDate(new Date(`${dateIn}T00:00:00+09:00`)) : "";

  // league-line parts: order + visibility, and the live field values the preview is built from
  const [slots, setSlots] = useState<TitleSlot[]>(() => titleSlots(editing ?? {}));
  const [orderTouched, setOrderTouched] = useState(false);
  const [vals, setVals] = useState(() => ({
    league: editing ? editing.league ?? "" : "3x3.EXE PREMIER", leagueSponsor: editing?.leagueSponsor ?? "", leagueExtra: editing?.leagueExtra ?? "",
    year: editing?.year ? String(editing.year) : "", season: editing?.season ?? "",
  }));
  const onFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "");
    setVals({ league: g("league"), leagueSponsor: g("leagueSponsor"), leagueExtra: g("leagueExtra"), year: g("year"), season: g("season") });
  };
  const labelM: LabelFields = {
    league: vals.league, leagueSponsor: vals.leagueSponsor, leagueExtra: vals.leagueExtra,
    year: vals.year ? Number(vals.year) : undefined, season: vals.season,
    date: dateIn ? `${dateIn}T00:00:00+09:00` : undefined,
    // untouched legacy matches keep their old rendering (e.g. 第N回 for 日本選手権)
    titleOrder: orderTouched || editing?.titleOrder ? serializeTitleOrder(slots) : undefined,
    showSeason: editing?.showSeason, hideYear: editing?.hideYear,
  };

  function toggleEntry(id: string) {
    setEntry((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  }
  const addGame = () => setGames((g) => [...g, { phase: "", opp: "", myScore: "", oppScore: "", wo: "", country: "" }]);
  const updGame = (i: number, patch: Partial<Game>) => setGames((g) => g.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const delGame = (i: number) => setGames((g) => g.filter((_, k) => k !== i));
  // typing a team that already has a country on file fills the flag in
  const setOpp = (i: number, opp: string) => {
    const known = oppCountries[opp.trim()];
    updGame(i, known && !games[i].country ? { opp, country: known } : { opp });
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!String(f.get("league") || "").trim() && !String(f.get("round") || "").trim()) {
      setMsg({ ok: false, text: "リーグかラウンドのどちらかは入力してください" });
      return;
    }
    setBusy(true);
    setMsg(null);
    const body = {
      id: editing?.id,
      league: f.get("league"),
      leagueSponsor: f.get("leagueSponsor"),
      prevLeagueSponsor: editing?.leagueSponsor ?? "",
      year: f.get("year"),
      season: f.get("season"),
      prevSeason: editing?.season ?? "",
      leagueExtra: f.get("leagueExtra"),
      prevLeagueExtra: editing?.leagueExtra ?? "",
      // the order is only stored once it has been changed (or was stored before), so
      // untouched old matches keep rendering exactly as they do now
      titleOrder: labelM.titleOrder ?? "",
      prevTitleOrder: editing?.titleOrder ?? "",
      // kept in step with the order for anything still reading the old flags
      showSeason: labelM.titleOrder ? slots.some((x) => x.part === "season" && x.on) : !!editing?.showSeason,
      prevShowSeason: !!editing?.showSeason,
      hideYear: labelM.titleOrder ? !slots.some((x) => (x.part === "year" || x.part === "season") && x.on) : !!editing?.hideYear,
      prevHideYear: !!editing?.hideYear,
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
        setDateIn("");
        setSlots(titleSlots({}));
        setOrderTouched(false);
      }
    } else {
      setMsg({ ok: false, text: d.error || "保存に失敗しました" });
    }
    setBusy(false);
  }

  const winHint = (g: Game) => {
    if (g.wo === "win") return "不戦勝";
    if (g.wo === "lose") return "不戦敗";
    const a = Number(g.myScore), b = Number(g.oppScore);
    if (!g.myScore || !g.oppScore || !Number.isFinite(a) || !Number.isFinite(b)) return "予定";
    return a > b ? "WIN" : "LOSE";
  };

  return (
    <AdminChrome title={editing ? "試合を編集" : "試合を追加"}>
      <PickList title={`既存の試合から選んで編集${editing ? "中" : ""}`} count={matches.length} newHref="/admin/match" newLabel="新規作成" editing={!!editing}>
        {matches.map((m, i) => (
          <div key={m.id}>
            {m.season !== matches[i - 1]?.season && <PickHeading first={i === 0}>{m.season ? `${m.season} SEASON` : "シーズン不明"}</PickHeading>}
            <PickRow href={`/admin/match?id=${m.id}`} active={editing?.id === m.id}>
              <span style={{ fontWeight: 700, opacity: 0.6, flex: "0 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.league || "—"}</span>
              <span style={{ fontWeight: 800, flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{roundTitle(m)}</span>
              <span style={{ opacity: 0.7, flex: "none", fontVariantNumeric: "tabular-nums" }}>{ymdShort(m.date, m.dateLabel)}</span>
            </PickRow>
          </div>
        ))}
      </PickList>

      <form onSubmit={submit} onChange={onFormChange}>
        <Section title="大会" desc="リーグかラウンドのどちらかは必須です。片方だけのときは、その名前がカードに大きく表示されます。">
          <Field label="リーグ" hint="スケジュールの絞り込みはこの名前でまとまります。冠スポンサー名は含めずに入力してください。">
            <input name="league" list="league-names" defaultValue={editing ? editing.league ?? "" : "3x3.EXE PREMIER"} placeholder="例：3XS" style={input} />
            <datalist id="league-names">{leagues.map((l) => <option key={l} value={l} />)}</datalist>
          </Field>
          <Field label="冠スポンサー" hint="リーグ名の前に付けて表示されます（例：PLCO → 「PLCO 3XS」）。">
            <input name="leagueSponsor" list="sponsor-names" defaultValue={editing?.leagueSponsor ?? ""} placeholder="例：PLCO" style={input} />
            <datalist id="sponsor-names">{sponsors.map((s) => <option key={s} value={s} />)}</datalist>
          </Field>
          <Field label="ラウンド" hint="例：ROUND.8 / PLAYOFFS / FINAL">
            <input name="round" defaultValue={roundTitle({ round: editing?.round })} placeholder="例：ROUND.8" style={input} />
          </Field>
          <Field label="その他" hint="回数などリーグ名に添える言葉（例：11th / 第11回）。絞り込みには影響しません。">
            <input name="leagueExtra" defaultValue={editing?.leagueExtra ?? ""} placeholder="例：11th" style={{ ...input, maxWidth: 280 }} />
          </Field>
          <Field label="年" hint="空欄なら開催日の年になります。">
            <input name="year" type="number" inputMode="numeric" defaultValue={editing?.year ?? ""} placeholder="2026" style={{ ...input, maxWidth: 200 }} />
          </Field>
          <Field label="シーズン" hint="通常は「自動」（4月〜翌3月で判定）。日程とシーズンがずれる大会だけ指定してください。">
            <select name="season" defaultValue={editing?.season ?? ""} style={{ ...input, maxWidth: 280 }}>
              <option value="">{autoSeason ? `自動（${autoSeason}）` : "自動（開催日から）"}</option>
              {SEASON_OPTS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="リーグ行の並び順と表示" hint="ラウンド名の上の行に出す項目を選び、↑↓で並べ替えます。黒い枠がサイトでの見え方です。">
            <TitleOrderEditor slots={slots} onChange={(x) => { setSlots(x); setOrderTouched(true); }} m={labelM} />
          </Field>
        </Section>

        <Section title="日程・会場">
          <Field label="開催日" hint="複数日の大会は初日を選んでください。">
            <input name="date" type="date" defaultValue={dateVal} onChange={(e) => setDateIn(e.target.value)} style={{ ...input, maxWidth: 280 }} />
          </Field>
          <Field label="日付の表示" hint="空欄なら開催日から自動（例：2026.7.18）。複数日の大会は「2026.7.18-19」のように入力します。">
            <input name="dateLabel" defaultValue={editing?.dateLabel ?? ""} placeholder="例：2026.6.13-14" style={input} />
          </Field>
          <Field label="会場">
            <input name="venue" defaultValue={editing?.venue ?? ""} placeholder="例：ビエント高崎（群馬県高崎市）" style={input} />
          </Field>
        </Section>

        <Section title="結果">
          <Field label="状態" required>
            <select name="status" defaultValue={editing?.status ?? "結果"} style={{ ...input, maxWidth: 280 }}>
              {MATCH_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="最終順位" hint="「優勝」「6位」などで入力すると、サイトでは 1st / 6th と表示されます。">
            <input name="resultBadge" defaultValue={editing?.resultBadge ?? ""} list="badges" placeholder="例：優勝 / 6位" style={{ ...input, maxWidth: 280 }} />
            <datalist id="badges">{RESULT_BADGES.map((b) => <option key={b} value={b} />)}</datalist>
          </Field>
          <Field label="試合スコア" hint="勝敗はスコアから自動で判定します。スコアを空欄のまま保存すると「予定」の試合になり、勝敗は付きません（試合後にスコアを入れてください）。「国・地域」を選ぶと、サイトで相手チーム名の後ろに国旗が付きます。国内の大会は空欄のまま、国際大会では日本のチームにも「日本」を選んでください。">
            {games.map((g, i) => {
              const hint = winHint(g);
              const win = hint === "WIN" || hint === "不戦勝";
              return (
                <div key={i} style={{ background: "#faf9f7", border: "1px solid #eee", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#888" }}>第{i + 1}試合</span>
                    <button type="button" onClick={() => delGame(i)} style={{ background: "none", border: "none", color: "#c33", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: 4 }}>この試合を削除</button>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    <input value={g.phase} onChange={(e) => updGame(i, { phase: e.target.value })} list="phases" placeholder="フェーズ（例：GROUP-A / 準決勝）" style={small} />
                    {/* on narrow screens the country picker wraps under the team name */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <input value={g.opp} onChange={(e) => setOpp(i, e.target.value)} placeholder="対戦相手" style={{ ...small, flex: "1 1 220px", minWidth: 0 }} />
                      <span style={{ display: "flex", gap: 8, alignItems: "center", flex: "none" }}>
                        <span aria-hidden="true" className="flag-emoji" style={{ flex: "none", width: 28, textAlign: "center", fontSize: 24 }}>{flagEmoji(g.country) || <span style={{ display: "inline-block", width: 24, height: 18, borderRadius: 3, background: "#ececec", verticalAlign: "middle" }} />}</span>
                        <select value={g.country} onChange={(e) => updGame(i, { country: e.target.value })} title="国・地域（海外チームのみ）" style={{ ...small, width: 160 }}>
                          <option value="">国内（国旗なし）</option>
                          {COUNTRY_GROUPS.map((grp) => (
                            <optgroup key={grp.region} label={grp.region}>
                              {grp.list.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <input value={g.myScore} onChange={(e) => updGame(i, { myScore: e.target.value })} type="number" inputMode="numeric" placeholder="自チーム" disabled={!!g.wo} style={{ ...small, width: 96, opacity: g.wo ? 0.4 : 1 }} />
                      <span style={{ color: "#999", fontWeight: 700 }}>-</span>
                      <input value={g.oppScore} onChange={(e) => updGame(i, { oppScore: e.target.value })} type="number" inputMode="numeric" placeholder="相手" disabled={!!g.wo} style={{ ...small, width: 96, opacity: g.wo ? 0.4 : 1 }} />
                      <select value={g.wo} onChange={(e) => updGame(i, { wo: e.target.value as Game["wo"] })} title="不戦勝/不戦敗" style={{ ...small, width: 110 }}>
                        <option value="">通常</option>
                        <option value="win">不戦勝</option>
                        <option value="lose">不戦敗</option>
                      </select>
                      {hint && <span style={{ fontWeight: 800, fontSize: 12.5, padding: "5px 10px", borderRadius: 6, background: win ? ORANGE : "#e6e6e6", color: win ? "#fff" : "#777" }}>{hint}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            <datalist id="phases">{GAME_PHASES.map((p) => <option key={p} value={p} />)}</datalist>
            <button type="button" onClick={addGame} style={{ width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 700, color: ORANGE, background: "#fff", border: `1px dashed ${ORANGE}`, borderRadius: 10, cursor: "pointer" }}>＋ 試合を追加</button>
          </Field>
        </Section>

        <Section title="出場選手" desc="選んだ選手が、試合カードの右側に丸い写真で表示されます。タップで選択／解除。">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {current.map((p) => (
              <Chip key={p.id} on={entry.includes(p.id)} onClick={() => toggleEntry(p.id)}>#{p.number} {p.nameEn}</Chip>
            ))}
          </div>
          {former.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <button type="button" onClick={() => setShowFormer((v) => !v)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#888" }}>
                <span style={{ transform: showFormer ? "rotate(90deg)" : "none", transition: "transform .15s", color: ORANGE, fontSize: 11 }}>▶</span>
                過去の選手（{former.length}）
              </button>
              {showFormer && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {former.map((p) => (
                    <Chip key={p.id} dashed on={entry.includes(p.id)} onClick={() => toggleEntry(p.id)}>#{p.number} {p.nameEn}</Chip>
                  ))}
                </div>
              )}
            </div>
          )}
        </Section>

        <Section title="リンク" desc="入力したものだけ、スケジュールページにボタンとして表示されます。">
          <Field label="大会公式サイト URL">
            <input name="eventUrl" type="url" defaultValue={editing?.eventUrl ?? ""} placeholder="https://…（大会・イベントのHP）" style={input} />
          </Field>
          <Field label="FIBA 3x3 イベントページ URL">
            <input name="fibaEventUrl" type="url" defaultValue={editing?.fibaEventUrl ?? ""} placeholder="https://play.fiba3x3.com/events/…" style={input} />
          </Field>
          <Field label="ライブ配信 URL">
            <input name="liveUrl" type="url" defaultValue={editing?.liveUrl ?? ""} placeholder="https://youtube.com/… など" style={input} />
          </Field>
        </Section>

        <Section title="備考">
          <Field label="備考" hint="会場変更・順延などイレギュラーな情報。スケジュールページにのみ表示されます（ホームのカードには出ません）。">
            <textarea name="memo" defaultValue={editing?.memo ?? ""} rows={3} placeholder="例：会場変更 / 悪天候により順延 など" style={{ ...input, resize: "vertical", lineHeight: 1.6 }} />
          </Field>
        </Section>

        <SaveBar busy={busy} editing={!!editing} msg={msg} />
      </form>
    </AdminChrome>
  );
}
