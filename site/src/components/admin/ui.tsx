"use client";

// Shared building blocks for the /admin forms: one field per row, grouped into
// titled sections, a hint under each label, and a save bar pinned to the bottom.

import { useState } from "react";

export const ORANGE = "#EE651C";

export const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "12px 14px",
  fontSize: 16, // 16px+ keeps iOS from zooming into the field on focus
  border: "1px solid #d6d6d6", borderRadius: 10, background: "#fff", color: "#141414",
};

export function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fff", borderRadius: 14, padding: "20px 22px 24px", marginBottom: 16, boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, margin: 0 }}>
        <span style={{ width: 4, height: 16, borderRadius: 2, background: ORANGE, flex: "none" }} />
        {title}
      </h2>
      {desc && <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#888", lineHeight: 1.6 }}>{desc}</p>}
      {children}
    </section>
  );
}

export function Field({ label, hint, required, children }: { label: string; hint?: React.ReactNode; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14 }}>
        {label}
        {required ? <span style={{ color: ORANGE, marginLeft: 4 }}>*</span> : <span style={{ color: "#aaa", fontWeight: 500, fontSize: 12, marginLeft: 6 }}>任意</span>}
      </div>
      {hint && <div style={{ fontSize: 12.5, color: "#888", lineHeight: 1.6, marginTop: 3 }}>{hint}</div>}
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}

export function Chip({ on, onClick, dashed, children }: { on: boolean; onClick: () => void; dashed?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: "9px 14px", borderRadius: 999, fontSize: 14, cursor: "pointer", border: `1px ${dashed ? "dashed" : "solid"}`, borderColor: on ? ORANGE : "#ccc", background: on ? ORANGE : dashed ? "#fafafa" : "#fff", color: on ? "#fff" : dashed ? "#777" : "#444", fontWeight: on ? 700 : 500 }}>
      {children}
    </button>
  );
}

/** Collapsible "pick an existing item to edit" card at the top of each form. */
export function PickList({ title, count, newHref, newLabel, editing, defaultOpen, children }: {
  title: string; count: number; newHref: string; newLabel: string; editing: boolean; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", marginBottom: 20, boxShadow: "0 6px 20px -14px rgba(0,0,0,.3)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button type="button" onClick={() => setOpen((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#141414", textAlign: "left" }}>
          <span style={{ display: "inline-block", transform: open ? "rotate(90deg)" : "none", transition: "transform .15s", color: ORANGE, fontSize: 11 }}>▶</span>
          {title}（{count}）
        </button>
        <a href={newHref} style={{ flex: "none", fontSize: 13, fontWeight: 700, color: "#fff", background: editing ? ORANGE : "#bbb", borderRadius: 8, padding: "7px 12px", textDecoration: "none" }}>＋ {newLabel}</a>
      </div>
      {open && <div style={{ marginTop: 14, maxHeight: 360, overflow: "auto" }}>{children}</div>}
    </div>
  );
}

/** Row in a PickList. */
export function PickRow({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a href={href}
      style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 13.5, padding: "10px 12px", marginBottom: 4, borderRadius: 9, textDecoration: "none", border: "1px solid", borderColor: active ? ORANGE : "#eee", background: active ? ORANGE : "#fafafa", color: active ? "#fff" : "#333" }}>
      {children}
    </a>
  );
}

export function PickHeading({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return <div style={{ fontWeight: 800, fontSize: 11.5, letterSpacing: ".08em", color: ORANGE, margin: first ? "0 2px 6px" : "14px 2px 6px" }}>{children}</div>;
}

/** Save bar pinned to the bottom of the viewport while the (long) form scrolls. */
export function SaveBar({ busy, editing, msg, extra }: { busy: boolean; editing: boolean; msg: { ok: boolean; text: string } | null; extra?: React.ReactNode }) {
  return (
    <div style={{ position: "sticky", bottom: 0, zIndex: 5, margin: "8px -18px 0", padding: "12px 18px calc(12px + env(safe-area-inset-bottom))", background: "rgba(244,244,242,.94)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", borderTop: "1px solid #e2e2de", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button type="submit" disabled={busy} style={{ padding: "13px 30px", fontSize: 16, fontWeight: 800, color: "#fff", background: busy ? "#f0a877" : ORANGE, border: "none", borderRadius: 10, cursor: "pointer" }}>
        {busy ? "保存中…" : editing ? "更新する" : "追加する"}
      </button>
      {extra}
      {msg && <span style={{ fontSize: 14, fontWeight: 700, color: msg.ok ? "#1a8f3c" : "#d11" }}>{msg.text}</span>}
    </div>
  );
}
