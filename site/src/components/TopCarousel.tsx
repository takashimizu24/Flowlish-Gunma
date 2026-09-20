"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TopBanner } from "@/lib/types";

const TR = "transform .6s cubic-bezier(.6,.05,.2,1)";
const GAP = 8;

function bg(b?: TopBanner, w = 900) {
  return b?.image ? `#141414 center/cover url(${b.image.url}?w=${w})` : "#141414";
}

export default function TopCarousel({ banners }: { banners: TopBanner[] }) {
  const N = banners.length;
  const [i, setI] = useState(0);
  const [anim, setAnim] = useState(true);
  const [pitch, setPitch] = useState(0);
  const [vpH, setVpH] = useState(0);
  const vpRef = useRef<HTMLDivElement>(null);

  const at = (k: number) => banners[((k % N) + N) % N];

  // desktop: right column is a vertical slider; measure so its 2 items (16:9)
  // + gap define the height, and the left big fills that same height.
  const measure = useCallback(() => {
    const vp = vpRef.current;
    if (!vp) return;
    if (!window.matchMedia("(min-width:901px)").matches) { setPitch(0); setVpH(0); return; }
    // Exact aspect height (no rounding) so pitch/height match the rendered
    // 16:9 items pixel-for-pixel — rounding here left sub-pixel gaps.
    const itemH = (vp.clientWidth * 9) / 16;
    setPitch(itemH + GAP);
    setVpH(2 * itemH + GAP);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (vpRef.current) ro.observe(vpRef.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [measure]);

  useEffect(() => {
    if (N < 2) return;
    const t = setInterval(() => setI((x) => x + 1), 3600);
    return () => clearInterval(t);
  }, [N]);

  const onEnd = () => {
    if (i >= N) {
      setAnim(false);
      setI(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
    }
  };

  if (N === 0) return null;

  if (N === 1) {
    return (
      <section id="news-top" style={{ background: "#141414" }}>
        <a href={banners[0].linkUrl || "#"} style={{ display: "block", aspectRatio: "16/9", background: bg(banners[0], 1600) }} />
      </section>
    );
  }

  const hItems = [...banners, banners[0]];                                   // left: N+1
  const vItems = [...banners.map((_, k) => at(k + 1)), at(1), at(2)];        // right: rotated +2 clones = N+2

  return (
    <section id="news-top" style={{ background: "#141414" }}>
      <div className="topnews-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: GAP, alignItems: "stretch" }}>
        {/* LEFT — horizontal slider, fills the row height */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div className="hcar-track" onTransitionEnd={onEnd} style={{ display: "flex", gap: GAP, transform: `translateX(calc(${-i * 100}% - ${i * GAP}px))`, transition: anim ? TR : "none" }}>
            {hItems.map((b, k) => (
              <a key={k} className="hcar-slide" href={b.linkUrl || "#"} style={{ minWidth: "100%", width: "100%", display: "block", background: bg(b, 1200) }} />
            ))}
          </div>
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 16, display: "flex", gap: 8, zIndex: 4 }}>
            {banners.map((_, k) => {
              const on = ((i % N) + N) % N === k;
              return <button key={k} aria-label={`slide ${k + 1}`} onClick={() => setI(k)} style={{ border: "none", cursor: "pointer", padding: 0, height: 9, width: on ? 24 : 9, borderRadius: on ? 5 : "50%", background: on ? "#EE651C" : "rgba(255,255,255,.45)", transition: ".2s" }} />;
            })}
          </div>
        </div>

        {/* RIGHT — vertical slider (desktop) / 2-up (mobile) */}
        <div style={{ minWidth: 0 }}>
          <div ref={vpRef} className="vcar-vp" style={{ position: "relative", overflow: "hidden", height: vpH ? `${vpH}px` : undefined }}>
            <div className="vcar-track" style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", flexDirection: "column", gap: GAP, transform: `translateY(${-i * pitch}px)`, transition: anim ? TR : "none" }}>
              {vItems.map((b, k) => (
                <a key={k} className="vcar-item" href={b.linkUrl || "#"} style={{ display: "block", background: bg(b, 800) }} />
              ))}
            </div>
          </div>
          <div className="mcar-vp" style={{ overflow: "hidden" }}>
            <div className="mcar-track" style={{ display: "flex", gap: GAP, transform: `translateX(calc(${-i * 50}% - ${i * (GAP / 2)}px))`, transition: anim ? TR : "none" }}>
              {vItems.map((b, k) => (
                <a key={k} className="mcar-item" href={b.linkUrl || "#"} style={{ display: "block", background: bg(b, 800) }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
