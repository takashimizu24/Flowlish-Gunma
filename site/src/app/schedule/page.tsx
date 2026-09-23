import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getMatches } from "@/lib/api";
import { rankLabel } from "@/lib/rank";
import { gameOutcome, isWin, isWalkover, OUTCOME_LABEL, type Outcome } from "@/lib/result";
import type { Match, Player } from "@/lib/types";

export const revalidate = 60;

const ORANGE = "#EE651C";
const INK = "#141414";

type Game = { phase: string; opp: string; score: string; result: string };

function parseGames(s?: string): Game[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v?.games) ? (v.games as Game[]) : [];
  } catch {
    return [];
  }
}

// Qualifying Draw = the pre-qualifying stage (予選の予選); checked before isPool
const isQualDraw = (phase: string) => /qualif|予選ドロー|予選の予選|(^|[^a-z])qd/i.test(phase);
const isPool = (phase: string) => /GROUP|POOL|予選|リーグ/i.test(phase);

function ymd(s?: string) {
  if (!s) return "";
  const d = new Date(s);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

// Unknown outcome (no score yet, unreadable score) renders nothing rather than
// defaulting to LOSE.
function ResultChip({ outcome }: { outcome: Outcome }) {
  if (!outcome) return <span style={{ width: 52, flex: "none" }} />;
  const win = isWin(outcome);
  const wo = isWalkover(outcome);
  return (
    <span style={{ fontWeight: 800, fontSize: wo ? 10 : 11, letterSpacing: wo ? 0 : ".04em", textTransform: "uppercase", width: 52, padding: "3px 0", textAlign: "center", boxSizing: "border-box", borderRadius: 5, flex: "none", background: win ? ORANGE : "rgba(20,20,20,.10)", color: win ? "#fff" : "rgba(20,20,20,.6)" }}>
      {OUTCOME_LABEL[outcome]}
    </span>
  );
}

function GameLine({ g }: { g: Game }) {
  const outcome = gameOutcome(g);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--line)" }}>
      <span style={{ flex: "none", width: 74, fontWeight: 700, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: ORANGE }}>{g.phase}</span>
      <span style={{ flex: "1 1 auto", minWidth: 0, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>vs {g.opp}</span>
      {/* a walkover keeps its "W-0" notation, dimmed — no points were scored */}
      <span style={{ flex: "none", fontWeight: 800, fontSize: 15, fontVariantNumeric: "tabular-nums", opacity: isWalkover(outcome) ? 0.45 : 1 }}>{g.score}</span>
      <ResultChip outcome={outcome} />
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
  return (
    <div className="entry-avatars" style={{ display: "grid", gridTemplateColumns: "repeat(2, 54px)", gap: "12px 10px", justifyContent: "flex-end" }}>
      {entry.map((p) => (
        <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
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
  const links: { label: string; href: string; kind: "event" | "fiba" | "live" }[] = [];
  if (m.eventUrl) links.push({ label: "大会情報", href: m.eventUrl, kind: "event" });
  if (m.fibaEventUrl) links.push({ label: "FIBA 3x3", href: m.fibaEventUrl, kind: "fiba" });
  if (m.liveUrl) links.push({ label: "LIVE配信", href: m.liveUrl, kind: "live" });
  if (links.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
      {links.map((l) => (
        <a key={l.kind} className={`match-link match-link--${l.kind}`} href={l.href} target="_blank" rel="noopener">
          {l.kind === "fiba" && <svg className="match-link-fiba" viewBox="0 0 841.89 595.28"><use href="/icons.svg#ic-fiba" /></svg>}
          {l.kind === "live" && <span className="match-link-dot" />}
          {l.label}
        </a>
      ))}
    </div>
  );
}

function MatchRow({ m }: { m: Match }) {
  const games = parseGames(m.scores);
  const qualDraw = games.filter((g) => isQualDraw(g.phase));
  const pool = games.filter((g) => !isQualDraw(g.phase) && isPool(g.phase));
  const playoff = games.filter((g) => !isQualDraw(g.phase) && !isPool(g.phase));
  const entry = m.entryPlayers ?? [];
  const upcoming = m.status !== "結果" || (!m.resultBadge && games.length === 0);

  return (
    <article style={{ background: "#fff", color: INK, borderRadius: 16, padding: "clamp(18px,3vw,28px)", marginBottom: 16 }}>
      <div className="sched-row" style={{ display: "flex", gap: 24 }}>
        {/* main */}
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: ORANGE }}>{m.league}</div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(22px,3.2vw,30px)", lineHeight: 1.05, margin: "2px 0 0", textTransform: "uppercase" }}>{m.round}</h2>
          {/* The date is Latin (Barlow Condensed) and the venue is Japanese, so the
              date needs a larger px size to read as the same height as the venue. */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 14px", marginTop: 3, fontSize: 13, lineHeight: 1.35 }}>
            <span style={{ fontSize: 16, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{m.dateLabel || ymd(m.date)}</span>
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

        {/* aside: entry + ranking */}
        <div className="sched-aside" style={{ flex: "0 0 150px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14, borderLeft: "1px solid var(--line)", paddingLeft: 20 }}>
          <EntryAvatars entry={entry} />
          <div style={{ textAlign: "right", marginTop: "auto" }}>
            {upcoming ? (
              <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: ORANGE, border: `2px solid ${ORANGE}`, borderRadius: 8, padding: "6px 14px", display: "inline-block" }}>UPCOMING</span>
            ) : m.resultBadge ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", opacity: 0.55 }}>Final Ranking</div>
                <div style={{ fontWeight: 800, fontSize: "clamp(30px,5vw,42px)", lineHeight: 1, color: ORANGE }}>{rankLabel(m.resultBadge)}</div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function SchedulePage() {
  const matches = await getMatches(50);
  // group by season year (derived from date); newest season first
  const bySeason = new Map<number, Match[]>();
  for (const m of matches) {
    const y = m.date ? new Date(m.date).getFullYear() : 0;
    if (!bySeason.has(y)) bySeason.set(y, []);
    bySeason.get(y)!.push(m);
  }
  const seasons = [...bySeason.keys()].sort((a, b) => b - a);

  return (
    <>
      <Header />
      <main style={{ background: INK, color: "#fff", minHeight: "70vh", padding: "clamp(36px,6vw,64px) 0 64px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 clamp(16px,4.5vw,48px)" }}>
          <h1 style={{ display: "inline-flex", alignItems: "center", gap: "clamp(8px,2.4vw,14px)", marginBottom: 6, fontWeight: 800, fontSize: "clamp(26px,4vw,42px)", letterSpacing: ".01em", lineHeight: 1, textTransform: "uppercase" }}>
            <span style={{ width: 13, height: ".78em", background: ORANGE, transform: "skewX(-11deg)", borderRadius: 1, flex: "none", display: "inline-block" }} />
            Schedule &amp; Results
          </h1>
          <p style={{ opacity: 0.6, fontSize: 13, margin: "0 0 30px 27px" }}>試合日程・結果</p>

          {matches.length === 0 ? (
            <p style={{ opacity: 0.6 }}>試合未登録</p>
          ) : (
            seasons.map((y) => (
              <section key={y} style={{ marginBottom: 40 }}>
                <h2 style={{ fontWeight: 800, fontSize: 20, textTransform: "uppercase", borderBottom: "2px solid rgba(255,255,255,.18)", paddingBottom: 8, marginBottom: 18 }}>
                  {y ? `${y} Season` : "Season"}
                </h2>
                {bySeason.get(y)!.map((m) => <MatchRow key={m.id} m={m} />)}
              </section>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
