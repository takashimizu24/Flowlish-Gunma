import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getNewsItem } from "@/lib/api";

export const revalidate = 60;

const ORANGE = "#EE651C";
const INK = "#141414";

export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = await getNewsItem(id);

  return (
    <>
      <Header />
      <main style={{ background: INK, color: "#fff", minHeight: "70vh", padding: "clamp(28px,5vw,52px) 0 64px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 clamp(16px,4.5vw,40px)" }}>
          <a href="/news" style={{ fontSize: 12, fontWeight: 700, color: "#fff", opacity: 0.7 }}>← お知らせ一覧へ</a>

          {!n ? (
            <p style={{ opacity: 0.7, marginTop: 30 }}>このお知らせは見つかりませんでした。</p>
          ) : (
            <article style={{ background: "#fff", color: INK, borderRadius: 16, overflow: "hidden", marginTop: 16 }}>
              {n.thumbnail && <img src={`${n.thumbnail.url}?w=1200`} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />}
              <div style={{ padding: "clamp(22px,4vw,36px)" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: ORANGE }}>{n.publishedDate ? new Date(n.publishedDate).toLocaleDateString("ja-JP") : ""}</div>
                <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, lineHeight: 1.4, margin: "8px 0 0" }}>{n.title}</h1>
                {n.categories?.length ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                    {n.categories.map((c) => <span key={c} style={{ fontWeight: 700, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", border: `1px solid ${INK}`, borderRadius: 999, padding: "3px 11px" }}>{c}</span>)}
                  </div>
                ) : null}
                {n.body && (
                  /</.test(n.body) ? (
                    <div style={{ marginTop: 22, fontSize: 15, lineHeight: 1.9 }} dangerouslySetInnerHTML={{ __html: n.body }} />
                  ) : (
                    <p style={{ marginTop: 22, fontSize: 15, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{n.body}</p>
                  )
                )}
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
