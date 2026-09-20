"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";

const ORANGE = "#EE651C";
const INK = "#141414";

function Cell({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div style={{ background: "#fff", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: ORANGE }}>{label}</span>
      <b style={{ fontSize: 15 }}>{value}</b>
    </div>
  );
}

export default function RosterSection({ players }: { players: Player[] }) {
  const [active, setActive] = useState<Player | null>(null);

  return (
    <>
      <div className="roster-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
        {players.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p)}
            style={{
              all: "unset", cursor: "pointer", position: "relative", borderRadius: 14, overflow: "hidden",
              aspectRatio: "3/4", background: p.photo ? `#141414 center/cover url(${p.photo.url}?w=800)` : "#1d1d1d",
              border: "2px solid #fff", display: "flex", flexDirection: "column", justifyContent: "flex-end", transition: "transform .2s",
            }}
          >
            <div style={{ position: "absolute", top: 12, right: 14, fontWeight: 700, fontSize: 52, color: ORANGE, lineHeight: 1 }}>{p.number}</div>
            <div style={{ padding: 12, background: "linear-gradient(0deg,rgba(20,20,20,.94),transparent)", color: "#fff" }}>
              {p.position && <span style={{ display: "block", lineHeight: 1, color: ORANGE, fontWeight: 800, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" }}>{p.position}</span>}
              <div style={{ fontWeight: 800, fontSize: 23, textTransform: "uppercase", lineHeight: 1.05, marginTop: 4, color: "#fff" }}>
                {p.nameEn}
                <small style={{ display: "block", fontWeight: 600, fontSize: 13, opacity: 0.85, textTransform: "none", marginTop: 4 }}>{p.nameJa}</small>
              </div>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          onClick={() => setActive(null)}
          className="pmodal-overlay"
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(10,10,12,.74)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className="pmodal"
            style={{ background: "#fff", color: INK, width: "min(760px,100%)", maxHeight: "88vh", overflow: "hidden", borderRadius: 16, position: "relative", boxShadow: "0 30px 80px -20px rgba(0,0,0,.6)" }}
          >
            <button onClick={() => setActive(null)} aria-label="閉じる"
              style={{ position: "absolute", top: 14, right: 14, width: 38, height: 38, borderRadius: 9, border: "1px solid rgba(20,20,20,.14)", background: "#fff", color: INK, fontSize: 20, cursor: "pointer", display: "grid", placeItems: "center", zIndex: 2, lineHeight: 1 }}>×</button>
            {(() => {
              const detail = active.photoDetail?.url || active.photo?.url;
              return <div className="pmodal-img" style={{ backgroundImage: detail ? `url(${detail}?w=760)` : undefined }} aria-hidden />;
            })()}
            <div className="pmodal-body" style={{ padding: 30 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center", paddingBottom: 20, borderBottom: "2px solid #141414" }}>
                <div style={{ fontWeight: 800, fontSize: 62, color: ORANGE, lineHeight: 0.8 }}>{active.number}</div>
                <div>
                  {active.position && <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: ORANGE }}>{active.position}</div>}
                  <div style={{ fontWeight: 800, fontSize: 26, textTransform: "uppercase", lineHeight: 1.05, marginTop: 3 }}>{active.nameEn}</div>
                  <div style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>{active.nameJa}</div>
                  {(active.snsInstagram || active.snsX || active.fibaUrl) && (
                    <div className="pmodal-sns">
                      {active.snsInstagram && (
                        <a href={active.snsInstagram} target="_blank" rel="noopener" aria-label="Instagram">
                          <svg><use href="/icons.svg#ic-ig" /></svg>
                        </a>
                      )}
                      {active.snsX && (
                        <a href={active.snsX} target="_blank" rel="noopener" aria-label="X">
                          <svg><use href="/icons.svg#ic-x" /></svg>
                        </a>
                      )}
                      {active.fibaUrl && (
                        <a href={active.fibaUrl} target="_blank" rel="noopener" aria-label="FIBA 3x3 player page">
                          <svg className="ic-fiba" viewBox="0 0 841.89 595.28"><use href="/icons.svg#ic-fiba" /></svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(20,20,20,.14)", border: "1px solid rgba(20,20,20,.14)", borderRadius: 10, overflow: "hidden", margin: "20px 0" }}>
                <Cell label="身長" value={active.height} />
                <Cell label="ポジション" value={typeof active.position === "string" ? active.position : undefined} />
                <Cell label="出身" value={active.hometown} />
                <Cell label="国籍" value={active.nationality} />
                <Cell label="生年月日" value={active.birthdate ? new Date(active.birthdate).toLocaleDateString("ja-JP") : undefined} />
              </div>
              {active.bio && <p style={{ fontSize: 14, lineHeight: 1.75, margin: "14px 0 0" }}>{active.bio}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
