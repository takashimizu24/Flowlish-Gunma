import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "COMPANY | FLOWLISH GUNMA", description: "FLOWLISH GUNMA の運営法人（株式会社FLOWLISH GUNMA／特定非営利活動法人FLOWLISH GUNMA）の概要です。" };

const ORANGE = "#EE651C";
const INK = "#141414";

// The club is run by two bodies that share an office.
const ENTITIES: { kind: string; name: string; repTitle: string; rep: string }[] = [
  { kind: "株式会社", name: "株式会社FLOWLISH GUNMA", repTitle: "代表取締役", rep: "花野 文昭" },
  { kind: "特定非営利活動法人", name: "特定非営利活動法人FLOWLISH GUNMA", repTitle: "代表理事", rep: "志村 潤" },
];

const ADDRESS = { zip: "〒370-0006", line: "群馬県高崎市問屋町1-8-2 アムールビル" };
const TEL = "027-393-6292";
const FAX = "027-393-6293";
const MAIL = "flowlish.gunma@gmail.com";
const FOUNDED = "2023年4月";

const th: React.CSSProperties = { width: "clamp(88px,22%,160px)", textAlign: "left", verticalAlign: "top", fontWeight: 700, fontSize: 13, color: ORANGE, padding: "18px 16px 18px 0", borderTop: "1px solid rgba(20,20,20,.12)", whiteSpace: "nowrap" };
const td: React.CSSProperties = { fontSize: 15, lineHeight: 1.8, padding: "16px 0", borderTop: "1px solid rgba(20,20,20,.12)" };
const link: React.CSSProperties = { color: INK, textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: "rgba(20,20,20,.3)" };

export default function CompanyPage() {
  return (
    <>
      <Header />
      <main style={{ background: INK, color: "#fff", minHeight: "70vh", padding: "clamp(36px,6vw,64px) 0 64px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 clamp(16px,4.5vw,48px)" }}>
          <h1 style={{ display: "inline-flex", alignItems: "center", gap: "clamp(8px,2.4vw,14px)", marginBottom: 6, fontWeight: 800, fontSize: "clamp(26px,4vw,42px)", letterSpacing: ".01em", lineHeight: 1, textTransform: "uppercase" }}>
            <span style={{ width: 13, height: ".78em", background: ORANGE, transform: "skewX(-11deg)", borderRadius: 1, flex: "none", display: "inline-block" }} />
            Company
          </h1>
          <p style={{ opacity: 0.6, fontSize: 13, margin: "0 0 28px 27px" }}>会社概要</p>

          <div style={{ background: "#fff", color: INK, borderRadius: 18, padding: "clamp(22px,4vw,44px)" }}>
            {/* the two operating bodies */}
            <div className="company-entities" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
              {ENTITIES.map((e) => (
                <section key={e.name} style={{ border: "1px solid rgba(20,20,20,.12)", borderRadius: 14, padding: "20px 22px" }}>
                  <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: ".14em", color: ORANGE }}>{e.kind}</div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 12 }}>商号</div>
                  <h2 style={{ fontSize: "clamp(17px,2vw,20px)", fontWeight: 800, lineHeight: 1.45, margin: "2px 0 0" }}>{e.name}</h2>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 14 }}>{e.repTitle}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{e.rep}</div>
                </section>
              ))}
            </div>

            {/* shared details */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32, borderBottom: "1px solid rgba(20,20,20,.12)" }}>
              <tbody>
                <tr>
                  <th style={th}>所在地</th>
                  <td style={td}>{ADDRESS.zip}<br />{ADDRESS.line}</td>
                </tr>
                <tr>
                  <th style={th}>連絡先</th>
                  <td style={td}>
                    TEL：<a href={`tel:${TEL.replace(/-/g, "")}`} style={link}>{TEL}</a><br />
                    FAX：{FAX}<br />
                    MAIL：<a href={`mailto:${MAIL}`} style={link}>{MAIL}</a>
                  </td>
                </tr>
                <tr>
                  <th style={th}>設立</th>
                  <td style={td}>{FOUNDED}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
