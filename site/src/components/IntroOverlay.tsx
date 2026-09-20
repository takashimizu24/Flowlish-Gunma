"use client";

import { useEffect, useState } from "react";

/**
 * Simple access intro: a black screen with the logo fading in, then the whole
 * overlay fades out to reveal the site. Plays once per browser session.
 * Rendered by default (also on the server) so the page never flashes before it.
 */
export default function IntroOverlay() {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("fg_intro") === "1"; } catch {}
    if (seen) { setVisible(false); return; }
    try { sessionStorage.setItem("fg_intro", "1"); } catch {}
    const t1 = setTimeout(() => setFade(true), 1250);   // begin fade-out
    const t2 = setTimeout(() => setVisible(false), 1900); // unmount
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed", inset: 0, zIndex: 9999, background: "#0b0b0b",
        display: "grid", placeItems: "center",
        opacity: fade ? 0 : 1, transition: "opacity .6s ease",
        pointerEvents: fade ? "none" : "auto",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="" className="intro-logo" style={{ width: 140, height: "auto" }} />
    </div>
  );
}
