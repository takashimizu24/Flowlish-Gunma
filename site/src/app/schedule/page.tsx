import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getMatches } from "@/lib/api";
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

const isPool = (phase: string) => /GROUP|POOL|予選|リーグ/i.test(phase);

function ymd(s?: string) {
  if (!s) return "";
  const d = new Date(s);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

function ResultChip({ result }: { result: string }) {
  const win = result.toLowerCase() === "win";
  return (
    <span style={{ fontWeight: 800, fontSize: 11, letterSpacing: ".04em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 5, flex: "none", background: win ? ORANGE : "rgba(20,20,20,.10)", color: win ? "#fff" : "rgba(20,20,20,.6)" }}>
      {win ? "WIN" : "LOSE"}
    </span>
  );
}

function GameLine({ g }: { g: Game }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--line)" }}>
      <span style={{ flex: "none", width: 74, fontWeight: 700, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: ORANGE }}>{g.phase}</span>
      <span style={{ flex: "1 1 auto", minWidth: 0, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>vs {g.opp}</span>
      <span style={{ flex: "none", fontWeight: 800, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{g.score}</span>
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
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
      {entry.map((p) => (
        <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: 46 }}>
          <span style={{ width: 40, height: 40, borderRadius: "50%", flex: "none", background: p.photo ? `#141414 top center/cover url(${p.photo.url}?w=120)` : "#141414" }} />
          <span style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", lineHeight: 1.1, textAlign: "center", color: INK, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 46 }}>
            {p.nameEn?.split(" ").slice(-1)[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

function MatchRow({ m }: { m: Match }) {
  const games = parseGames(m.scores);
  const pool = games.filter((g) => isPool(g.phase));
  const playoff = games.filter((g) => !isPool(g.phase));
  const entry = m.entryPlayers ?? [];
  const upcoming = m.status !== "結果" || (!m.resultBadge && games.length === 0);

  return (
    <article style={{ background: "#fff", color: INK, borderRadius: 16, padding: "clamp(18px,3vw,28px)", marginBottom: 16 }}>
      <div className="sched-row" style={{ display: "flex", gap: 24 }}>
        {/* main */}
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: ORANGE }}>{m.league}</div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(22px,3.2vw,30px)", lineHeight: 1.05, margin: "2px 0 0", textTransform: "uppercase" }}>{m.round}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px", marginTop: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{m.dateLabel || ymd(m.date)}</span>
            {m.venue && <span style={{ opacity: 0.7 }}>{m.venue}</span>}
          </div>
          {games.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <GameGroup title="予選ラウンド" games={pool} />
              <GameGroup title="決勝トーナメント" games={playoff} />
            </div>
          )}
          {m.note && <p style={{ fontSize: 12, opacity: 0.7, margin: "10px 0 0", whiteSpace: "pre-wrap" }}>{m.note}</p>}
        </div>

        {/* aside: entry + ranking */}
        <div className="sched-aside" style={{ flex: "0 0 190px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14, borderLeft: "1px solid var(--line)", paddingLeft: 20 }}>
          <EntryAvatars entry={entry} />
          <div style={{ textAlign: "right", marginTop: "auto" }}>
            {upcoming ? (
              <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: ORANGE, border: `2px solid ${ORANGE}`, borderRadius: 8, padding: "6px 14px", display: "inline-block" }}>UPCOMING</span>
            ) : m.resultBadge ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", opacity: 0.55 }}>Final Ranking</div>
                <div style={{ fontWeight: 800, fontSize: "clamp(30px,5vw,42px)", lineHeight: 1, color: ORANGE }}>{m.resultBadge}</div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
            <span style={{ width: 13, height: ".78em", background: ORANGE, transform: "skewX(-11deg)", borderRadius: 1, flex: "none", display: "inline-block" }} />
            <h1 style={{ fontWeight: 800, fontSize: "clamp(26px,4.4vw,44px)", letterSpacing: ".01em", lineHeight: 1, textTransform: "uppercase", margin: 0 }}>Schedule &amp; Results</h1>
          </div>
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
