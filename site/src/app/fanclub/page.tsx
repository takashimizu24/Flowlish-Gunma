import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "FAN CLUB | FLOWLISH GUNMA" };

const ORANGE = "#EE651C";
const INK = "#141414";

export default function FanClubPage() {
  return (
    <>
      <Header />
      <main style={{ background: INK, color: "#fff", minHeight: "72vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(48px,10vw,120px) clamp(16px,4.5vw,56px)", textAlign: "center" }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <span style={{ width: 12, height: ".85em", background: ORANGE, transform: "skewX(-11deg)", borderRadius: 1, display: "inline-block" }} />
            <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: ".22em", textTransform: "uppercase", color: ORANGE }}>Fan Club</span>
          </div>

          <h1 style={{ fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(44px,10vw,110px)", lineHeight: 0.95, letterSpacing: ".01em", margin: 0 }}>
            Coming<br />Soon
          </h1>

          <p style={{ margin: "26px auto 0", maxWidth: "34ch", fontSize: "clamp(14px,2.2vw,16px)", lineHeight: 1.9, opacity: 0.82 }}>
            公式ファンクラブは現在準備中です。<br />
            入会方法や特典の詳細が決まり次第、こちらのページでお知らせします。<br />
            公開までもう少しお待ちください。
          </p>

          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 34, fontWeight: 800, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "#fff", border: "1.5px solid rgba(255,255,255,.4)", borderRadius: 999, padding: "11px 24px" }}>
            ← Back to Home
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
