"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      const next = new URLSearchParams(location.search).get("next") || "/admin";
      location.href = next.startsWith("/admin") ? next : "/admin";
    } else {
      const d = await r.json().catch(() => ({}));
      setError(d.error || "ログインできませんでした");
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f4f2", padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <form onSubmit={submit} style={{ background: "#fff", borderRadius: 16, padding: 32, width: "min(380px,100%)", boxShadow: "0 20px 60px -24px rgba(0,0,0,.3)" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#141414", marginBottom: 4 }}>FLOWLISH 管理</div>
        <p style={{ color: "#777", fontSize: 13, margin: "0 0 22px" }}>合言葉を入力してください</p>
        <input
          type="password"
          value={password}
          autoFocus
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", fontSize: 16, border: "1px solid #d8d8d8", borderRadius: 10, outlineColor: "#EE651C" }}
        />
        {error && <p style={{ color: "#d11", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
        <button type="submit" disabled={busy || !password} style={{ marginTop: 16, width: "100%", padding: "13px", fontSize: 15, fontWeight: 800, color: "#fff", background: busy ? "#f0a877" : "#EE651C", border: "none", borderRadius: 10, cursor: "pointer" }}>
          {busy ? "確認中…" : "ログイン"}
        </button>
      </form>
    </main>
  );
}
