import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RosterSection from "@/components/RosterSection";
import TopCarousel from "@/components/TopCarousel";
import ScheduleCarousel from "@/components/ScheduleCarousel";
import IntroOverlay from "@/components/IntroOverlay";
import VideoGallery from "@/components/VideoGallery";
import { getPlayers, getNews, getMatches, getPartners, getBanners } from "@/lib/api";
import { getVideos, type Video } from "@/lib/youtube";
import { siteConfig } from "@/lib/config";
import { rankLabel } from "@/lib/rank";
import { roundTitle, matchYear, leagueLabel, hasJP, isSingle, matchTitle } from "@/lib/match";
import { LeagueLabel, Keep3x3 } from "@/components/LeagueLabel";
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
        <a href="/schedule" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", border: "1.5px solid rgba(255,255,255,.4)", borderRadius: 999, padding: "8px 16px", whiteSpace: "nowrap", flex: "none" }}>VIEW ALL</a>
      </div>
      {matches.length === 0 ? (
        <div style={container}><Empty label="試合未登録（microCMS「matches」に追加すると、ここにカードが並びます）" /></div>
      ) : (
        <ScheduleCarousel>
          {matches.map((m) => {
            const entry = m.entryPlayers ?? [];
            return (
              <div key={m.id} className="sched-card" style={{ scrollSnapAlign: "start", background: "#fff", color: INK, borderRadius: 14, padding: 22, height: 248, display: "flex", gap: 18, overflow: "hidden" }}>
                {/* left: league + round big */}
                <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {isSingle(m) ? (
                    matchYear(m) ? <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: ".03em", color: ORANGE, lineHeight: 1.12, fontVariantNumeric: "tabular-nums" }}>{matchYear(m)}</div> : null
                  ) : (
                    <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: hasJP(leagueLabel(m)) ? "0" : ".03em", textTransform: hasJP(leagueLabel(m)) ? "none" : "uppercase", color: ORANGE, lineHeight: 1.12 }}><LeagueLabel m={m} /></div>
                  )}
                  {(() => { const t = matchTitle(m); const jp = hasJP(t); return (
                    <div style={{ fontWeight: 800, fontSize: jp ? 22 : 30, lineHeight: jp ? 1.34 : 1.04, marginTop: 3, textTransform: jp ? "none" : "uppercase" }}><Keep3x3 text={t} /></div>
                  ); })()}
                  <div style={{ fontWeight: 600, fontSize: 24, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                    {m.dateLabel || ymd(m.date)}
                  </div>
                  {m.venue && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{m.venue}</div>}
                  {(m.memo || m.note) && <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.memo || m.note}</div>}
                  {m.resultBadge && <div style={{ marginTop: 14 }}><span style={{ fontWeight: 700, fontSize: 16, padding: "6px 13px", borderRadius: 7, background: ORANGE, color: "#fff", display: "inline-block" }}>{rankLabel(m.resultBadge)}</span></div>}
                </div>
                {/* right: entry members (circular photos, vertical) */}
                {entry.length > 0 && (
                  <div style={{ flex: "0 0 138px", borderLeft: "1px solid var(--line)", paddingLeft: 16, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: ORANGE }}>Entry</div>
                    {entry.map((p) => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ flex: "none", width: 30, height: 30, borderRadius: "50%", background: p.photo ? `#141414 top center/cover url(${p.photo.url}?w=90)` : "#141414" }} />
                        <span style={{ fontWeight: 400, fontSize: 19, color: ORANGE, lineHeight: 1, minWidth: 20, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{p.number}</span>
                        <span style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nameEn}</span>
                      </div>
                    ))}
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

const YT_PLAY = (
  <svg viewBox="0 0 68 48" aria-hidden="true"><path d="M66.5 7.5c-.8-3-3-5.2-6-6C55 0 34 0 34 0S13 0 7.5 1.5c-3 .8-5.2 3-6 6C0 13 0 24 0 24s0 11 1.5 16.5c.8 3 3 5.2 6 6C13 48 34 48 34 48s21 0 26.5-1.5c3-.8 5.2-3 6-6C68 35 68 24 68 24s0-11-1.5-16.5z" fill="#FF0000" /><path d="M27 34.5l18-10.5-18-10.5z" fill="#fff" /></svg>
);
function MovieHeading() {
  return (
    <div style={{ ...container, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Heading>Movie</Heading>
      <a href={siteConfig.sns.youtube} target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", border: "1.5px solid rgba(255,255,255,.4)", borderRadius: 999, padding: "8px 16px", whiteSpace: "nowrap", flex: "none" }}>View All →</a>
    </div>
  );
}

function Movie({ videos }: { videos: Video[] }) {
  if (videos.length === 0) {
    // fallback: no API key / no videos yet — simple channel CTA
    return (
      <section id="movie" style={{ ...section, background: INK, padding: "56px 0" }}>
        <MovieHeading />
        <div style={container}>
          <a href={siteConfig.sns.youtube} target="_blank" rel="noopener" className="movie-card" aria-label="FLOWLISH GUNMA 公式YouTubeチャンネル">
            <span className="movie-play">{YT_PLAY}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "clamp(20px,3.4vw,30px)", letterSpacing: ".02em", textTransform: "uppercase", color: "#fff", lineHeight: 1.1 }}>Official YouTube</div>
              <div style={{ opacity: 0.72, fontSize: "clamp(12px,2.4vw,14px)", marginTop: 8, color: "#fff" }}>試合ハイライトや最新ムービーはYouTube公式チャンネルで公開中。</div>
            </div>
            <span className="movie-cta">チャンネルを見る →</span>
          </a>
        </div>
      </section>
    );
  }
  return (
    <section id="movie" style={{ ...section, background: INK, padding: "56px 0" }}>
      <MovieHeading />
      <div style={container}>
        <VideoGallery videos={videos} />
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
            <a href="/news" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: INK, border: `1.5px solid ${INK}`, borderRadius: 999, padding: "8px 16px", whiteSpace: "nowrap", flex: "none" }}>VIEW ALL</a>
          </div>
          {news.length === 0 ? (
            <Empty label="お知らせ未登録" />
          ) : (
            <div className="news-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "30px 26px" }}>
              {news.map((n) => (
                <a key={n.id} href={`/news/${n.id}`} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span style={{ width: "100%", aspectRatio: "16/9", borderRadius: 8, background: n.thumbnail ? `#141414 center/cover url(${n.thumbnail.url}?w=640)` : "#e6e6e6", flex: "none" }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: ORANGE }}>{n.publishedDate ? new Date(n.publishedDate).toLocaleDateString("ja-JP") : ""}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.42, color: INK }}>{n.title}</h3>
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
    getPlayers(), getNews(), getMatches(), getPartners(), getBanners(), getVideos(5),
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
        <Movie videos={videos} />
        <Roster players={players} />
        <Partners partners={partners} />
      </main>
      <Footer />
    </>
  );
}
