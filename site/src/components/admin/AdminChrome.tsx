"use client";

const ORANGE = "#EE651C";

export function AdminChrome({ title, children }: { title: string; children: React.ReactNode }) {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    location.href = "/admin/login";
  }
  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f2", fontFamily: "system-ui, -apple-system, 'Hiragino Kaku Gothic ProN', sans-serif", color: "#141414" }}>
      <header style={{ background: "#141414", color: "#fff" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 18px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="/admin" style={{ color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>FLOWLISH 管理</a>
            <a href="/admin/match" style={{ color: "#ddd", fontSize: 13, textDecoration: "none" }}>試合</a>
            <a href="/admin/news" style={{ color: "#ddd", fontSize: 13, textDecoration: "none" }}>お知らせ</a>
          </div>
          <button onClick={logout} style={{ background: "transparent", color: "#bbb", border: "1px solid #444", borderRadius: 7, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>ログアウト</button>
        </div>
      </header>
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "24px 18px 64px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 18px", borderLeft: `4px solid ${ORANGE}`, paddingLeft: 10 }}>{title}</h1>
        {children}
      </main>
    </div>
  );
}
