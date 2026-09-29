"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TopBanner } from "@/lib/types";

const TR = "transform .6s cubic-bezier(.6,.05,.2,1)";
const GAP = 8;

// Slides are drawn with <img object-fit:cover>, not a background image: the boxes
// get fractional sizes on phones (e.g. 192.5 x 108.28), and a repeating cover
// background then wraps a 1px strip of the image's opposite edge into view.
const slideBox: React.CSSProperties = { position: "relative", overflow: "hidden", display: "block", background: "#141414" };

function Img({ b, w }: { b?: TopBanner; w: number }) {
  if (!b?.image) return null;
  return (
    <img
      src={`${b.image.url}?w=${w}`}
      alt={b.title || ""}
      draggable={false}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
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
    const t = setInterval(() => setI((x) => x + 1), 4600);
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
        <a href={banners[0].linkUrl || "#"} style={{ ...slideBox, aspectRatio: "16/9" }}><Img b={banners[0]} w={1600} /></a>
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
              <a key={k} className="hcar-slide" href={b.linkUrl || "#"} style={{ ...slideBox, minWidth: "100%", width: "100%" }}><Img b={b} w={1200} /></a>
            ))}
          </div>
        </div>

        {/* RIGHT — vertical slider (desktop) / 2-up (mobile) */}
        <div style={{ minWidth: 0 }}>
          <div ref={vpRef} className="vcar-vp" style={{ position: "relative", overflow: "hidden", height: vpH ? `${vpH}px` : undefined }}>
            <div className="vcar-track" style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", flexDirection: "column", gap: GAP, transform: `translateY(${-i * pitch}px)`, transition: anim ? TR : "none" }}>
              {vItems.map((b, k) => (
                <a key={k} className="vcar-item" href={b.linkUrl || "#"} style={slideBox}><Img b={b} w={800} /></a>
              ))}
            </div>
          </div>
          <div className="mcar-vp" style={{ overflow: "hidden" }}>
            <div className="mcar-track" style={{ display: "flex", gap: GAP, transform: `translateX(calc(${-i * 50}% - ${i * (GAP / 2)}px))`, transition: anim ? TR : "none" }}>
              {vItems.map((b, k) => (
                <a key={k} className="mcar-item" href={b.linkUrl || "#"} style={slideBox}><Img b={b} w={800} /></a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* pagination dots — below the carousel, centered across the full width */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "14px 0 4px" }}>
        {banners.map((_, k) => {
          const on = ((i % N) + N) % N === k;
          return <button key={k} aria-label={`slide ${k + 1}`} onClick={() => setI(k)} style={{ border: "none", cursor: "pointer", padding: 0, height: 9, width: on ? 24 : 9, borderRadius: on ? 5 : "50%", background: on ? "#EE651C" : "rgba(255,255,255,.4)", transition: ".2s" }} />;
        })}
      </div>
    </section>
  );
}
