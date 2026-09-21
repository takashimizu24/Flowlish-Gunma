import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getNews } from "@/lib/api";

export const revalidate = 60;

const ORANGE = "#EE651C";
const INK = "#141414";

export default async function NewsPage() {
  const news = await getNews(100);
  return (
    <>
      <Header />
      <main style={{ background: INK, color: "#fff", minHeight: "70vh", padding: "clamp(36px,6vw,64px) 0 64px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(16px,4.5vw,48px)" }}>
          <h1 style={{ display: "inline-flex", alignItems: "center", gap: "clamp(8px,2.4vw,14px)", marginBottom: 6, fontWeight: 800, fontSize: "clamp(26px,4vw,42px)", letterSpacing: ".01em", lineHeight: 1, textTransform: "uppercase" }}>
            <span style={{ width: 13, height: ".78em", background: ORANGE, transform: "skewX(-11deg)", borderRadius: 1, flex: "none", display: "inline-block" }} />
            News
          </h1>
          <p style={{ opacity: 0.6, fontSize: 13, margin: "0 0 30px 27px" }}>お知らせ一覧</p>

          {news.length === 0 ? (
            <p style={{ opacity: 0.6 }}>お知らせ未登録</p>
          ) : (
            <div className="news-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "28px 24px" }}>
              {news.map((n) => (
                <a key={n.id} href={`/news/${n.id}`} style={{ display: "flex", flexDirection: "column", background: "#fff", color: INK, borderRadius: 14, overflow: "hidden" }}>
                  <span style={{ width: "100%", aspectRatio: "16/9", background: n.thumbnail ? `#141414 center/cover url(${n.thumbnail.url}?w=640)` : "#e6e6e6", flex: "none" }} />
                  <span style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 18px 20px" }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: ORANGE }}>{n.publishedDate ? new Date(n.publishedDate).toLocaleDateString("ja-JP") : ""}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.42 }}>{n.title}</h3>
                    {n.categories?.length ? (
                      <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {n.categories.map((c) => <span key={c} style={{ fontWeight: 700, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", border: `1px solid ${INK}`, borderRadius: 999, padding: "3px 11px" }}>{c}</span>)}
                      </span>
                    ) : null}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
