import { siteConfig } from "@/lib/config";

const COLS: { title: string; links: string[] }[] = [
  { title: "Team", links: ["選手紹介", "スタッフ", "チーム概要", "SDGs"] },
  { title: "Game", links: ["ラウンド結果 / 日程", "ニュース", "ホームゲーム"] },
  { title: "Support", links: ["ファンクラブ", "スクール", "スポンサー募集", "SHOP"] },
];

const SNS = [
  { label: "Instagram", href: siteConfig.sns.instagram, icon: "ic-ig" },
  { label: "X", href: siteConfig.sns.x, icon: "ic-x" },
  { label: "Facebook", href: siteConfig.sns.facebook, icon: "ic-fb" },
  { label: "LINE", href: siteConfig.sns.line, icon: "ic-line" },
  { label: "YouTube", href: siteConfig.sns.youtube, icon: "ic-yt" },
];

const h4: React.CSSProperties = { fontWeight: 800, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--orange)", margin: "0 0 14px" };
const linkStyle: React.CSSProperties = { display: "block", color: "#fff", opacity: 0.85, fontSize: 14, padding: "5px 0" };

export default function Footer() {
  return (
    <footer style={{ background: "#141414", color: "#fff", padding: "56px 0 30px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4.5vw,56px)" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 30 }}>
          <div>
            <img src="/logo.svg" alt="FLOWLISH GUNMA" style={{ height: 72, marginBottom: 20 }} />
            <p style={{ opacity: 0.85, fontSize: 14, margin: "0 0 18px", maxWidth: "34ch" }}>
              群馬・高崎を拠点に活動する女子3x3バスケットボールチーム。地域とともに、世界の舞台へ。
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {SNS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener" aria-label={s.label}
                   style={{ width: 38, height: 38, border: "1px solid rgba(255,255,255,.16)", borderRadius: 9, display: "grid", placeItems: "center", color: "#fff" }}>
                  <svg style={{ width: 22, height: 22, fill: "currentColor", display: "block" }}><use href={`/icons.svg#${s.icon}`} /></svg>
                </a>
              ))}
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 style={h4}>{c.title}</h4>
              {c.links.map((l) => (
                <a key={l} href="#" style={linkStyle}>{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, paddingTop: 26, borderTop: "1px solid rgba(255,255,255,.16)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, color: "#fff", opacity: 0.6, fontSize: 12 }}>
          <span>© {new Date().getFullYear()} FLOWLISH GUNMA. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
