import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RosterSection from "@/components/RosterSection";
import TopCarousel from "@/components/TopCarousel";
import ScheduleCarousel from "@/components/ScheduleCarousel";
import IntroOverlay from "@/components/IntroOverlay";
import VideoSection from "@/components/VideoSection";
import FitLine from "@/components/FitLine";
import OneLine from "@/components/OneLine";
import LeagueLogo from "@/components/LeagueLogo";
import { getPlayers, getNews, getMatches, getPartners, getBanners } from "@/lib/api";
import { getChannelVideos, type Video } from "@/lib/youtube";
import { siteConfig } from "@/lib/config";
import { rankLabel } from "@/lib/rank";
import { yearLabel, leagueLabel, hasJP, isSingle, matchTitle, sortEntry } from "@/lib/match";
import { LeagueLabel, TitleText } from "@/components/LeagueLabel";
import { isCmsConfigured } from "@/lib/microcms";
import type { News, Match, Player } from "@/lib/types";

export const revalidate = 60;

const ORANGE = "#EE651C";
const INK = "#141414";

function Bar() {
  return <span style={{ width: 13, height: ".78em", background: ORANGE, transform: "skewX(-11deg)", borderRadius: 1, flex: "none", display: "inline-block" }} />;
}
function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(26px,4vw,42px)", letterSpacing: ".01em", lineHeight: 1, display: "inline-flex", alignItems: "center", gap: "clamp(8px,2.4vw,14px)", margin: 0 }}>
      <Bar />
      {children}
    </h2>
  );
}
const section: React.CSSProperties = { scrollMarginTop: 120 };
const container: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4.5vw,56px)" };
const panel: React.CSSProperties = { background: "#fff", color: INK, borderRadius: 18, padding: "clamp(22px,3.2vw,40px)" };

function Empty({ label }: { label: string }) {
  return <p style={{ opacity: 0.55, fontSize: 14, margin: 0 }}>{label}</p>;
}

// "2026.8.8" (year.month.day) — formatted in JST so the day never shifts by
// the server/host timezone (Vercel runs in UTC).
function ymd(s?: string) {
  if (!s) return "";
  const j = new Date(new Date(s).getTime() + 9 * 3600 * 1000);
  return `${j.getUTCFullYear()}.${j.getUTCMonth() + 1}.${j.getUTCDate()}`;
}

/* ---------------- sections ---------------- */

function Schedule({ matches }: { matches: Match[] }) {
  return (
    <section id="schedule" style={{ ...section, background: INK, color: "#fff", padding: "52px 0 38px" }}>
      <div style={{ ...container, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Heading>Schedule</Heading>
        <a href="/schedule" className="pill-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", border: "1.5px solid rgba(255,255,255,.4)", borderRadius: 999, padding: "8px 16px", whiteSpace: "nowrap", flex: "none" }}>VIEW ALL</a>
      </div>
      {matches.length === 0 ? (
        <div style={container}><Empty label="試合未登録（microCMS「matches」に追加すると、ここにカードが並びます）" /></div>
      ) : (
        <ScheduleCarousel>
          {matches.map((m) => {
            const entry = sortEntry(m.entryPlayers);
            return (
              <div key={m.id} className="sched-card" style={{ scrollSnapAlign: "start", background: "#fff", color: INK, borderRadius: 14, padding: 22, minHeight: 248, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {/* top: logo + league + round big, then date / venue / placing. The memo (備考) is
                    shown on the schedule page only. minHeight (not a fixed height): a long title
                    that wraps grows the card — and, via the track's stretch, its siblings. */}
                <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
                  {/* league + round lines, with the competition logo in the card's top-right corner */}
                  <div className="lg-head lg-head--corner">
                    <LeagueLogo league={m.league} />
                    <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                      {isSingle(m) ? (
                        yearLabel(m) ? <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: ".03em", color: ORANGE, lineHeight: 1.12, fontVariantNumeric: "tabular-nums" }}>{yearLabel(m)}</div> : null
                      ) : (
                        // long league names (e.g. FIBA 3x3 WOMEN'S SERIES 2026) shrink to stay on one line on PC
                        <FitLine max={19} min={14} style={{ fontWeight: 800, letterSpacing: hasJP(leagueLabel(m)) ? "0" : ".03em", textTransform: hasJP(leagueLabel(m)) ? "none" : "uppercase", color: ORANGE, lineHeight: 1.12 }}><LeagueLabel m={m} /></FitLine>
                      )}
                      {(() => { const t = matchTitle(m); const jp = hasJP(t); return (
                        <div style={{ fontWeight: 800, fontSize: 30, lineHeight: jp ? 1.28 : 1.04, marginTop: 3, textTransform: "uppercase" }}><TitleText text={t} /></div>
                      ); })()}
                    </div>
                  </div>
                  {/* 4px: makes the visible gap round -> date match league -> round (~16px of ink gap) */}
                  <div style={{ fontWeight: 600, fontSize: 24, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{m.dateLabel || ymd(m.date)}</div>
                  {/* venue: one line only — hidden entirely when it doesn't fit */}
                  {m.venue && <OneLine style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{m.venue}</OneLine>}
                </div>
                {/* bottom (pinned to the card's foot): entry members in one row (photo, number +
                    surname) on the left, the final placing in the bottom-right corner */}
                {(entry.length > 0 || m.resultBadge) && (
                  <div style={{ marginTop: "auto", borderTop: "1px solid var(--line)", paddingTop: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
                    <div className="entry-row">
                      {entry.map((p) => (
                        <div key={p.id} className="entry-item">
                          <span className="entry-photo" style={{ background: p.photo ? `#141414 top center/cover url(${p.photo.url}?w=120)` : "#141414" }} />
                          <span className="entry-label">
                            <span className="entry-num" style={{ color: ORANGE }}>{p.number}</span>
                            <span className="entry-name">{p.nameEn?.split(" ").slice(-1)[0]}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* original proportions (16px text in 7/13px padding), scaled up ×1.3 */}
                    {m.resultBadge && <span className="place-badge" style={{ background: ORANGE }}>{rankLabel(m.resultBadge)}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </ScheduleCarousel>
      )}
    </section>
  );
}

function FanClubBanner() {
  return (
    <section style={{ background: INK, padding: "10px 0 48px" }}>
      <div style={container}>
        <a href={siteConfig.fanClubUrl} className="fanclub-banner" aria-label="公式ファンクラブ会員募集中">
          <img src="/fanclub-banner.jpg" alt="FLOWLISH GUNMA 公式ファンクラブ会員募集中" style={{ width: "100%", height: "auto", display: "block" }} />
        </a>
      </div>
    </section>
  );
}

/**
 * 公式チャンネルの最新動画。microCMS は使わず、チャンネルの公開フィードから
 * そのまま拾う。動画が取れなかったときは何も描かない（セクションごと消える）。
 */
function VideoBlock({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null;
  return (
    <section id="video" style={{ ...section, background: INK, color: "#fff", padding: "56px 0" }}>
      <div style={{ ...container, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Heading>Video</Heading>
        <a href={siteConfig.sns.youtube} target="_blank" rel="noopener" className="pill-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", border: "1.5px solid rgba(255,255,255,.4)", borderRadius: 999, padding: "8px 16px", whiteSpace: "nowrap", flex: "none" }}>VIEW ALL</a>
      </div>
      <div style={container}>
        <VideoSection videos={videos} />
      </div>
    </section>
  );
}

function NewsList({ news }: { news: News[] }) {
  return (
    <section id="news" style={{ ...section, background: INK, padding: "0 0 8px" }}>
      <div style={container}>
        <div style={panel}>
          <div style={{ marginBottom: "clamp(22px,3.2vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Heading>News</Heading>
            <a href="/news" className="pill-btn pill-btn--ink" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: INK, border: `1.5px solid ${INK}`, borderRadius: 999, padding: "8px 16px", whiteSpace: "nowrap", flex: "none" }}>VIEW ALL</a>
          </div>
          {news.length === 0 ? (
            <Empty label="お知らせ未登録" />
          ) : (
            <div className="news-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "30px 26px" }}>
              {news.map((n) => (
                <a key={n.id} href={`/news/${n.id}`} className="news-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span className="news-thumb-wrap" style={{ borderRadius: 8 }}>
                    <span className="news-thumb" style={{ background: n.thumbnail ? `#141414 center/cover url(${n.thumbnail.url}?w=640)` : "#e6e6e6" }} />
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: ORANGE }}>{n.publishedDate ? new Date(n.publishedDate).toLocaleDateString("ja-JP") : ""}</span>
                  <h3 className="news-title" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.42, color: INK }}>{n.title}</h3>
                  {n.categories?.length ? (
                    <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {n.categories.map((c) => <span key={c} style={{ fontWeight: 700, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", border: `1px solid ${INK}`, color: INK, borderRadius: 999, padding: "3px 11px" }}>{c}</span>)}
                    </span>
                  ) : null}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Roster({ players }: { players: Player[] }) {
  return (
    <section id="roster" style={{ ...section, background: INK, padding: "56px 0" }}>
      <div style={container}>
        <div style={panel}>
          <div style={{ marginBottom: "clamp(22px,3.2vw,40px)" }}><Heading>Players</Heading></div>
          {players.length === 0 ? (
            <Empty label="選手未登録" />
          ) : (
            <RosterSection players={players} />
          )}
        </div>
      </div>
    </section>
  );
}

// Sponsor tiles are sized by rank tier (1 = biggest). Tiers come from the
// `tier` field ("1".."5"); higher tier = larger tile (fewer per row).
const TIER_ORDER = ["BLACK", "PLATINUM", "GOLD", "SILVER", "BRONZE", "ORANGE", "PARTNER", "SUPPLY"];
const TIER_MINW: Record<string, number> = { BLACK: 440, PLATINUM: 300, GOLD: 240, SILVER: 185, BRONZE: 150, ORANGE: 138, PARTNER: 124, SUPPLY: 124 };
// rank label shown above each tier group
const TIER_LABEL: Record<string, string> = {
  BLACK: "BLACK PARTNER",
  PLATINUM: "PLATINUM PARTNER",
  GOLD: "GOLD PARTNER",
  SILVER: "SILVER PARTNER",
  BRONZE: "BRONZE PARTNER",
  ORANGE: "ORANGE PARTNER",
  PARTNER: "PARTNER",
  SUPPLY: "SUPPLY PARTNER",
};

function Partners({ partners }: { partners: { id: string; name: string; logo?: { url: string }; url?: string; tier?: string }[] }) {
  const groups = TIER_ORDER
    .map((t) => ({ t, list: partners.filter((p) => (p.tier || "PARTNER") === t) }))
    .filter((g) => g.list.length > 0);
  return (
    <section id="partners" style={{ ...section, background: "#f2f2f0", color: INK, padding: "clamp(46px,7vw,80px) 0" }}>
      <div style={container}>
        <div style={{ marginBottom: 30 }}><Heading>Partners</Heading></div>
        {partners.length === 0 ? (
          <p style={{ opacity: 0.55, fontSize: 14, margin: 0, color: INK }}>スポンサー未登録</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            {groups.map(({ t, list }) => (
              <div key={t}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: ORANGE, whiteSpace: "nowrap" }}>{TIER_LABEL[t] || t}</span>
                  <span style={{ flex: 1, height: 1, background: "rgba(20,20,20,.14)" }} />
                </div>
                <div style={{ display: "grid", gap: 14, gridTemplateColumns: `repeat(auto-fill, minmax(min(${TIER_MINW[t]}px, 100%), 1fr))` }}>
                  {list.map((p) => (
                    <a key={p.id} className="partners-tile" href={p.url || "#"} target="_blank" rel="noopener" title={p.name}>
                      {p.logo ? <img src={`${p.logo.url}?h=300`} alt={p.name} /> : <span style={{ fontWeight: 700, fontSize: 14, textAlign: "center", color: INK }}>{p.name}</span>}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default async function Home() {
  const [players, news, matches, partners, banners, videos] = await Promise.all([
    getPlayers(), getNews(), getMatches(), getPartners(), getBanners(), getChannelVideos(siteConfig.youtubeChannelId, 5),
  ]);

  return (
    <>
      <IntroOverlay />
      <Header />
      <main style={{ background: INK }}>
        {!isCmsConfigured && (
          <div style={{ background: ORANGE, color: "#fff", textAlign: "center", padding: "9px 24px", fontSize: 12 }}>CMS未接続（.env.local を設定してください）</div>
        )}
        <TopCarousel banners={banners} />
        <Schedule matches={matches} />
        <FanClubBanner />
        <NewsList news={news} />
        <VideoBlock videos={videos} />
        <Roster players={players} />
        <Partners partners={partners} />
      </main>
      <Footer />
    </>
  );
}
