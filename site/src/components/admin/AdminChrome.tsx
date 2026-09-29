"use client";

import { usePathname } from "next/navigation";

const ORANGE = "#EE651C";

const NAV = [
  { label: "試合", href: "/admin/match" },
  { label: "お知らせ", href: "/admin/news" },
  { label: "選手", href: "/admin/players" },
];

export function AdminChrome({ title, children }: { title: string; children: React.ReactNode }) {
  const path = usePathname();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    location.href = "/admin/login";
  }
  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f2", fontFamily: "system-ui, -apple-system, 'Hiragino Kaku Gothic ProN', sans-serif", color: "#141414" }}>
      <header style={{ background: "#141414", color: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
        {/* two rows so it never crowds on a phone: title + logout, then the section tabs */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 18px" }}>
          <div style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <a href="/admin" style={{ color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none", whiteSpace: "nowrap" }}>FLOWLISH 管理</a>
            <button onClick={logout} style={{ flex: "none", background: "transparent", color: "#bbb", border: "1px solid #444", borderRadius: 7, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>ログアウト</button>
          </div>
          <nav style={{ display: "grid", gridTemplateColumns: `repeat(${NAV.length}, 1fr)`, gap: 6, paddingBottom: 10 }}>
            {NAV.map((n) => {
              const on = path?.startsWith(n.href);
              return (
                <a key={n.href} href={n.href} style={{ textAlign: "center", color: on ? "#fff" : "#bbb", background: on ? ORANGE : "rgba(255,255,255,.08)", fontWeight: on ? 800 : 600, fontSize: 14, textDecoration: "none", padding: "9px 6px", borderRadius: 8, whiteSpace: "nowrap" }}>{n.label}</a>
              );
            })}
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 18px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 18px", borderLeft: `4px solid ${ORANGE}`, paddingLeft: 10 }}>{title}</h1>
        {children}
        <div style={{ height: 48 }} />
      </main>
    </div>
  );
}
