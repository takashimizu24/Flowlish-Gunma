import { siteConfig } from "@/lib/config";
import { getMatches } from "@/lib/api";
import { matchSeason, seasonStart, isUpcoming } from "@/lib/match";
import ScheduleMenu from "./ScheduleMenu";

const NAV = [
  { label: "HOME", href: "/" },
  { label: "SCHEDULE", href: "/schedule" },
  { label: "NEWS", href: "/news" },
  { label: "TEAM", href: "/#roster" },
  { label: "PARTNERS", href: "/#partners" },
  { label: "SCHOOL", href: siteConfig.schoolUrl },
  { label: "SHOP", href: siteConfig.shopUrl },
];

const SNS: { label: string; href: string; icon: string }[] = [
  { label: "Instagram", href: siteConfig.sns.instagram, icon: "ic-ig" },
  { label: "X", href: siteConfig.sns.x, icon: "ic-x" },
  { label: "Facebook", href: siteConfig.sns.facebook, icon: "ic-fb" },
  { label: "LINE", href: siteConfig.sns.line, icon: "ic-line" },
  { label: "YouTube", href: siteConfig.sns.youtube, icon: "ic-yt" },
];

// Links for the SCHEDULE drop-down: upcoming count, each season, and the main
// leagues picked in siteConfig.menuLeagues.
async function scheduleMenu() {
  const matches = await getMatches(100).catch(() => []);
  const seasons = new Map<string, number>();
  const leagues = new Map<string, number>();
  let upcoming = 0;
  for (const m of matches) {
    const s = matchSeason(m);
    if (s) seasons.set(s, (seasons.get(s) ?? 0) + 1);
    if (m.league) leagues.set(m.league, (leagues.get(m.league) ?? 0) + 1);
    if (isUpcoming(m)) upcoming++;
  }
  return {
    upcoming,
    seasons: [...seasons].sort((a, b) => seasonStart(b[0]) - seasonStart(a[0])).map(([s, count]) => ({ label: `${s} SEASON`, href: `/schedule?season=${s}`, count })),
    leagues: siteConfig.menuLeagues
      .filter((l) => leagues.has(l))
      .map((l) => ({ label: l, href: `/schedule?league=${encodeURIComponent(l)}`, count: leagues.get(l)! })),
  };
}

export default async function Header() {
  const menu = await scheduleMenu();
  return (
    <header id="top" style={{ position: "sticky", top: 0, zIndex: 50 }}>
      {/* top dark bar */}
      <div style={{ background: "#141414" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4.5vw,56px)", height: 84, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/"><img src="/logo.svg" alt="FLOWLISH GUNMA" style={{ height: 54, width: "auto", display: "block" }} /></a>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="sns" style={{ display: "flex", gap: 8 }}>
              {SNS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener" aria-label={s.label}
                   style={{ width: 36, height: 36, border: "1px solid rgba(255,255,255,.26)", borderRadius: 8, display: "grid", placeItems: "center", color: "#fff" }}>
                  <svg style={{ width: 22, height: 22, fill: "currentColor", display: "block" }}><use href={`/icons.svg#${s.icon}`} /></svg>
                </a>
              ))}
            </div>
            <a href={siteConfig.fanClubUrl} className="cta"
               style={{ fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", background: "var(--orange)", color: "#fff", height: 36, padding: "0 18px", borderRadius: 8, display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>
              Fan Club
            </a>
          </div>
        </div>
      </div>
      {/* white menu bar */}
      <nav className="site-nav" style={{ background: "#fff", borderTop: "1px solid var(--line)", boxShadow: "0 5px 16px -7px rgba(0,0,0,.22)" }}>
        <div className="nav-wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4.5vw,56px)", display: "flex" }}>
          <div className="nav-links" style={{ display: "flex" }}>
            {NAV.map((n, i) => {
              const external = n.href.startsWith("http");
              const style: React.CSSProperties = { fontWeight: 700, fontSize: 17, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink)", padding: i === 0 ? "10px 22px 10px 0" : "10px 22px", display: "flex", alignItems: "center" };
              if (n.href === "/schedule") return <ScheduleMenu key={n.label} linkStyle={style} {...menu} />;
              return (
                <a key={n.label} href={n.href} {...(external ? { target: "_blank", rel: "noopener" } : {})} style={style}>
                  {n.label}
                </a>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
