import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScheduleView from "@/components/ScheduleView";
import { getMatches } from "@/lib/api";

export const revalidate = 60;

const ORANGE = "#EE651C";
const INK = "#141414";

export default async function SchedulePage() {
  const matches = await getMatches(100);

  return (
    <>
      <Header />
      <main style={{ background: INK, color: "#fff", minHeight: "70vh", padding: "clamp(36px,6vw,64px) 0 64px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 clamp(16px,4.5vw,48px)" }}>
          <h1 style={{ display: "inline-flex", alignItems: "center", gap: "clamp(8px,2.4vw,14px)", marginBottom: 6, fontWeight: 700, fontSize: "clamp(26px,4vw,42px)", letterSpacing: ".01em", lineHeight: 1, textTransform: "uppercase" }}>
            <span style={{ width: 13, height: ".78em", background: ORANGE, transform: "skewX(-11deg)", borderRadius: 1, flex: "none", display: "inline-block" }} />
            Schedule &amp; Results
          </h1>
          <p style={{ opacity: 0.6, fontSize: 13, margin: "0 0 24px 27px" }}>試合日程・結果</p>

          {matches.length === 0 ? (
            <p style={{ opacity: 0.6 }}>試合未登録</p>
          ) : (
            <ScheduleView matches={matches} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
