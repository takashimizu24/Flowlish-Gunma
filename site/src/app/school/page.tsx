import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "SCHOOL | FLOWLISH GUNMA" };

const ORANGE = "#EE651C";
const INK = "#141414";

export default function SchoolPage() {
  return (
    <>
      <Header />
      <main style={{ background: INK, color: "#fff", minHeight: "72vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(48px,10vw,120px) clamp(16px,4.5vw,56px)", textAlign: "center" }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <span style={{ width: 12, height: ".85em", background: ORANGE, transform: "skewX(-11deg)", borderRadius: 1, display: "inline-block" }} />
            <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: ".22em", textTransform: "uppercase", color: ORANGE }}>School</span>
          </div>

          <h1 style={{ fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(44px,10vw,110px)", lineHeight: 0.95, letterSpacing: ".01em", margin: 0 }}>
            Coming<br />Soon
          </h1>

          <p style={{ margin: "26px auto 0", fontSize: "clamp(11px,2.7vw,16px)", lineHeight: 2, opacity: 0.82 }}>
            <span style={{ display: "block", whiteSpace: "nowrap" }}>スクールは現在準備中です。</span>
            <span style={{ display: "block", whiteSpace: "nowrap" }}>開講日程や申込方法が決まり次第、こちらでお知らせします。</span>
            <span style={{ display: "block", whiteSpace: "nowrap" }}>開講までもう少しお待ちください。</span>
          </p>

          <a href="/" className="pill-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 34, fontWeight: 800, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "#fff", border: "1.5px solid rgba(255,255,255,.4)", borderRadius: 999, padding: "11px 24px" }}>
            ← Back to Home
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
