"use client";

import { useEffect, useMemo, useState } from "react";
import { rankLabel } from "@/lib/rank";
import { yearLabel, leagueLabel, hasJP, isSingle, matchTitle, matchSeason, seasonStart, isUpcoming, sortEntry } from "@/lib/match";
import { LeagueLabel, TitleText } from "@/components/LeagueLabel";
import LeagueLogo from "@/components/LeagueLogo";
import type { Match, Player } from "@/lib/types";
import { countryName, flagEmoji } from "@/lib/countries";

const ORANGE = "#EE651C";
const INK = "#141414";

type Game = { phase: string; opp: string; score: string; result: string; country?: string };

function parseGames(s?: string): Game[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v?.games) ? (v.games as Game[]) : [];
  } catch {
    return [];
  }
}

const isQualDraw = (phase: string) => /qualif|予選ドロー|予選の予選|(^|[^a-z])qd/i.test(phase);
const isPool = (phase: string) => /GROUP|POOL|予選|リーグ/i.test(phase);

function ymd(s?: string) {
  if (!s) return "";
  const j = new Date(new Date(s).getTime() + 9 * 3600 * 1000);
  return `${j.getUTCFullYear()}.${j.getUTCMonth() + 1}.${j.getUTCDate()}`;
}

const isWalkover = (r: string) => /^wo-|walkover/i.test(r) || r === "不戦勝" || r === "不戦敗";
const isWin = (r: string) => { const x = r.toLowerCase(); return x === "win" || x === "wo-win" || r === "不戦勝"; };

// a game with no result yet is scheduled
const isScheduled = (r?: string) => !(r || "").trim();

function ResultChip({ result }: { result: string }) {
  if (isScheduled(result)) {
    return (
      <span style={{ fontWeight: 800, fontSize: 10.5, width: 52, padding: "2px 0", textAlign: "center", boxSizing: "border-box", borderRadius: 5, flex: "none", border: "1px solid rgba(20,20,20,.25)", color: "rgba(20,20,20,.55)" }}>予定</span>
    );
  }
  const win = isWin(result);
  const wo = isWalkover(result);
  const text = wo ? (win ? "不戦勝" : "不戦敗") : win ? "WIN" : "LOSE";
  return (
    <span style={{ fontWeight: 800, fontSize: wo ? 10.5 : 11, letterSpacing: wo ? "0" : ".04em", textTransform: "uppercase", width: 52, padding: "3px 0", textAlign: "center", boxSizing: "border-box", borderRadius: 5, flex: "none", background: win ? ORANGE : "rgba(20,20,20,.10)", color: win ? "#fff" : "rgba(20,20,20,.6)" }}>
      {text}
    </span>
  );
}

function GameLine({ g }: { g: Game }) {
  const wo = isWalkover(g.result);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--line)" }}>
      <span style={{ flex: "none", width: 74, fontWeight: 700, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: ORANGE }}>{g.phase}</span>
      <span style={{ flex: "1 1 auto", minWidth: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
        <span style={{ flex: "none" }}>vs</span>
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.opp}</span>
        {/* overseas opponents only (a game with no country is a domestic team); stays visible when a long name truncates */}
        {flagEmoji(g.country) && (
          <span className="flag-emoji" role="img" aria-label={countryName(g.country)} title={countryName(g.country)} style={{ flex: "none", fontSize: 17 }}>{flagEmoji(g.country)}</span>
        )}
      </span>
      <span style={{ flex: "none", fontWeight: 800, fontSize: 15, fontVariantNumeric: "tabular-nums", opacity: wo || isScheduled(g.result) ? 0.4 : 1 }}>{wo || isScheduled(g.result) ? "—" : g.score}</span>
      <ResultChip result={g.result} />
    </div>
  );
}

function GameGroup({ title, games }: { title: string; games: Game[] }) {
  if (games.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: INK, opacity: 0.55, marginBottom: 2 }}>{title}</div>
      {games.map((g, i) => <GameLine key={i} g={g} />)}
    </div>
  );
}

function EntryAvatars({ entry }: { entry: Player[] }) {
  if (entry.length === 0) return null;
  const odd = entry.length % 2 === 1;
  return (
    <div className="entry-avatars" style={{ display: "grid", gridTemplateColumns: "repeat(2, 54px)", gap: "12px 10px", justifyContent: "center" }}>
      {entry.map((p, i) => (
        <div key={p.id} className={odd && i === entry.length - 1 ? "entry-av-solo" : undefined} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span className="entry-av" style={{ width: 48, height: 48, borderRadius: "50%", flex: "none", background: p.photo ? `#141414 top center/cover url(${p.photo.url}?w=140)` : "#141414" }} />
          <span style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", lineHeight: 1.1, textAlign: "center", color: INK, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 54 }}>
            {p.nameEn?.split(" ").slice(-1)[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

function MatchLinks({ m }: { m: Match }) {
  const links: { label: string; href: string; kind: "article" | "event" | "fiba" | "live" }[] = [];
  // a related article that is still a draft gets no button (its page would be "not found")
  const article = m.articleUrl?.find((n) => !!n?.publishedAt);
  // order: FIBA 3x3 → 大会情報 → LIVE → 記事
  if (m.fibaEventUrl) links.push({ label: "FIBA 3x3", href: m.fibaEventUrl, kind: "fiba" });
  if (m.eventUrl) links.push({ label: "大会情報", href: m.eventUrl, kind: "event" });
  if (m.liveUrl) links.push({ label: "LIVE配信", href: m.liveUrl, kind: "live" });
  if (article) links.push({ label: "記事", href: `/news/${article.id}`, kind: "article" });
  if (links.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
      {links.map((l) => {
        const external = /^https?:/i.test(l.href);
        return (
          <a key={l.kind} className={`match-link match-link--${l.kind}`} href={l.href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
            {l.kind === "article" && <svg className="match-link-article" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h11a2 2 0 0 1 2 2v13H6a2 2 0 0 1-2-2z" /><line x1="7.5" y1="8" x2="13.5" y2="8" /><line x1="7.5" y1="11.5" x2="13.5" y2="11.5" /></svg>}
            {l.kind === "fiba" && <svg className="match-link-fiba" viewBox="0 0 841.89 595.28"><use href="/icons.svg#ic-fiba" /></svg>}
            {l.kind === "live" && <span className="match-link-dot" />}
            {l.label}
          </a>
        );
      })}
    </div>
  );
}

// league / year line above the title: 15px on phones up to 20px on PC (title is 30px there)
const LEAGUE_FS = "clamp(15px, 2vw, 20px)";

function MatchRow({ m }: { m: Match }) {
  const games = parseGames(m.scores);
  const qualDraw = games.filter((g) => isQualDraw(g.phase));
  const pool = games.filter((g) => !isQualDraw(g.phase) && isPool(g.phase));
  const playoff = games.filter((g) => !isQualDraw(g.phase) && !isPool(g.phase));
  const entry = sortEntry(m.entryPlayers);
  const upcoming = isUpcoming(m);
  const single = isSingle(m);
  const year = yearLabel(m);
  const title = matchTitle(m);
  const jpTitle = hasJP(title);
  const jpLeague = hasJP(leagueLabel(m));

  return (
    <article style={{ background: "#fff", color: INK, borderRadius: 16, padding: "clamp(18px,3vw,28px)", marginBottom: 16 }}>
      <div className="sched-row" style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          {/* league + round lines, competition logo on the right (as on the home cards) */}
          <div className="lg-head lg-head--list lg-head--corner">
            <LeagueLogo league={m.league} size="list" />
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              {single ? (
                year ? <div style={{ fontWeight: 800, fontSize: LEAGUE_FS, letterSpacing: ".04em", color: ORANGE, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}>{year}</div> : null
              ) : (
                <div style={{ fontWeight: 800, fontSize: LEAGUE_FS, letterSpacing: jpLeague ? "0" : ".04em", textTransform: jpLeague ? "none" : "uppercase", color: ORANGE, lineHeight: 1.2 }}><LeagueLabel m={m} /></div>
              )}
              <h2 style={{ fontWeight: 800, fontSize: "clamp(22px,3.2vw,30px)", margin: "2px 0 0", lineHeight: jpTitle ? 1.32 : 1.05, letterSpacing: jpTitle ? "normal" : undefined, textTransform: "uppercase" }}><TitleText text={title} /></h2>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 14px", marginTop: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 800, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{m.dateLabel || ymd(m.date)}</span>
            {m.venue && <span style={{ opacity: 0.7 }}>{m.venue}</span>}
          </div>
          {games.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <GameGroup title="Qualifying Draw" games={qualDraw} />
              <GameGroup title="予選ラウンド" games={pool} />
              <GameGroup title="決勝トーナメント" games={playoff} />
            </div>
          )}
          {(m.memo || m.note) && (
            <p style={{ fontSize: 12.5, margin: "12px 0 0", padding: "8px 12px", background: "rgba(238,101,28,.08)", borderLeft: `3px solid ${ORANGE}`, borderRadius: "0 6px 6px 0", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{m.memo || m.note}</p>
          )}
          <MatchLinks m={m} />
        </div>

        <div className="sched-aside" style={{ flex: "0 0 150px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, borderLeft: "1px solid var(--line)", paddingLeft: 20 }}>
          <EntryAvatars entry={entry} />
          <div style={{ textAlign: "center", marginTop: "auto" }}>
            {upcoming ? (
              <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: ORANGE, border: `2px solid ${ORANGE}`, borderRadius: 8, padding: "6px 14px", display: "inline-block" }}>UPCOMING</span>
            ) : m.resultBadge ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", opacity: 0.55 }}>Final Ranking</div>
                <div style={{ fontWeight: 700, fontSize: "clamp(30px,5vw,42px)", lineHeight: 1, color: ORANGE }}>{rankLabel(m.resultBadge)}</div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

const selStyle: React.CSSProperties = {};

export default function ScheduleView({ matches }: { matches: Match[] }) {
  const { leagues, seasons, players } = useMemo(() => {
    const lg = new Set<string>();
    const ss = new Set<string>();
    const pl = new Map<string, { id: string; number: number; nameEn: string }>();
    for (const m of matches) {
      if (m.league) lg.add(m.league);
      const s = matchSeason(m); if (s) ss.add(s);
      // filter options: current roster only (active players)
      for (const p of m.entryPlayers ?? []) if (p.active !== false && !pl.has(p.id)) pl.set(p.id, { id: p.id, number: p.number, nameEn: p.nameEn });
    }
    return {
      leagues: [...lg],
      seasons: [...ss].sort((a, b) => seasonStart(b) - seasonStart(a)),
      players: [...pl.values()].sort((a, b) => (a.number || 99) - (b.number || 99)),
    };
  }, [matches]);

  const [fLeague, setFLeague] = useState("");
  const [fSeason, setFSeason] = useState(""); // opens unfiltered: all seasons
  const [fPlayer, setFPlayer] = useState("");
  const [fView, setFView] = useState(""); // "" | "upcoming" | "results"

  // Filters live in the URL (?season=&league=&player=&view=) so the header's
  // schedule menu can link straight to a filtered list, and the URL can be shared.
  const [urlRead, setUrlRead] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setFSeason(q.get("season") ?? "");
    setFLeague(q.get("league") ?? "");
    setFPlayer(q.get("player") ?? "");
    setFView(q.get("view") ?? "");
    setUrlRead(true);
  }, []);
  useEffect(() => {
    if (!urlRead) return;
    const q = new URLSearchParams();
    if (fSeason) q.set("season", fSeason);
    if (fLeague) q.set("league", fLeague);
    if (fPlayer) q.set("player", fPlayer);
    if (fView) q.set("view", fView);
    const qs = q.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [urlRead, fSeason, fLeague, fPlayer, fView]);

  const filtered = useMemo(() => {
    const list = matches.filter((m) =>
      (!fLeague || m.league === fLeague) &&
      (!fSeason || matchSeason(m) === fSeason) &&
      (!fPlayer || (m.entryPlayers ?? []).some((p) => p.id === fPlayer)) &&
      (!fView || isUpcoming(m) === (fView === "upcoming"))
    );
    // upcoming: soonest first
    return fView === "upcoming" ? [...list].reverse() : list;
  }, [matches, fLeague, fSeason, fPlayer, fView]);

  const grouped = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const y = matchSeason(m) || "0";
      if (!map.has(y)) map.set(y, []);
      map.get(y)!.push(m);
    }
    return [...map.keys()].sort((a, b) => seasonStart(b) - seasonStart(a)).map((y) => ({ y, list: map.get(y)! }));
  }, [filtered]);

  const active = fLeague || fSeason || fPlayer || fView;
  const reset = () => { setFLeague(""); setFSeason(""); setFPlayer(""); setFView(""); };

  return (
    <>
      <div className="sched-filters">
        <label className="sched-filter">
          <span>試合</span>
          <select value={fView} onChange={(e) => setFView(e.target.value)}>
            <option value="">すべて</option>
            <option value="upcoming">今後の予定</option>
            <option value="results">結果</option>
          </select>
        </label>
        <label className="sched-filter">
          <span>シーズン</span>
          <select value={fSeason} onChange={(e) => setFSeason(e.target.value)}>
            <option value="">全シーズン</option>
            {seasons.map((y) => <option key={y} value={y}>{y} SEASON</option>)}
          </select>
        </label>
        <label className="sched-filter">
          <span>リーグ</span>
          <select value={fLeague} onChange={(e) => setFLeague(e.target.value)} style={selStyle}>
            <option value="">すべて</option>
            {leagues.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="sched-filter">
          <span>出場選手</span>
          <select value={fPlayer} onChange={(e) => setFPlayer(e.target.value)}>
            <option value="">すべて</option>
            {players.map((p) => <option key={p.id} value={p.id}>#{p.number} {p.nameEn}</option>)}
          </select>
        </label>
        {active ? (
          <button type="button" className="sched-filter-reset" onClick={reset}>× クリア</button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p style={{ opacity: 0.6, padding: "24px 0" }}>該当する試合がありません。</p>
      ) : (
        grouped.map(({ y, list }) => (
          <section key={y} style={{ marginBottom: 40 }}>
            <h2 style={{ fontWeight: 800, fontSize: 20, textTransform: "uppercase", borderBottom: "2px solid rgba(255,255,255,.18)", paddingBottom: 8, marginBottom: 18 }}>
              {y !== "0" ? `${y} Season` : "Season"}
            </h2>
            {list.map((m) => <MatchRow key={m.id} m={m} />)}
          </section>
        ))
      )}
    </>
  );
}
