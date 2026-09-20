"use client";

import { useEffect, useState } from "react";

/**
 * Access intro: a black screen with the logo fading in, then the screen splits
 * down the middle and the two halves slide apart to reveal the site.
 * Plays once per browser session. Server-rendered so the page never flashes.
 */
export default function IntroOverlay() {
  const [visible, setVisible] = useState(true);
  const [split, setSplit] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("fg_intro") === "1"; } catch {}
    if (seen) { setVisible(false); return; }
    try { sessionStorage.setItem("fg_intro", "1"); } catch {}
    const t1 = setTimeout(() => setSplit(true), 1150);   // start the split
    const t2 = setTimeout(() => setVisible(false), 1950); // unmount after it clears
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  // Each half is slightly over 50% so there's no seam in the middle before the split.
  const half: React.CSSProperties = {
    position: "absolute", top: 0, bottom: 0, width: "50.5%", background: "#0b0b0b",
    transition: "transform .7s cubic-bezier(.76,0,.24,1)",
  };

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden", pointerEvents: split ? "none" : "auto" }}>
      <div style={{ ...half, left: 0, transform: split ? "translateX(-100%)" : "none" }} />
      <div style={{ ...half, right: 0, transform: split ? "translateX(100%)" : "none" }} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: split ? 0 : 1, transition: "opacity .3s ease" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" className="intro-logo" style={{ width: 140, height: "auto" }} />
      </div>
    </div>
  );
}
