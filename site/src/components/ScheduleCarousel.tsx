"use client";

import { useRef } from "react";

/** Horizontal schedule carousel with left/right arrows (all breakpoints). */
export default function ScheduleCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 448), behavior: "smooth" });
  };
  return (
    <div style={{ position: "relative" }}>
      <button type="button" aria-label="前のスケジュール" className="sched-arrow sched-arrow--left" onClick={() => scroll(-1)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 5 8 12 15 19" /></svg>
      </button>
      <div
        ref={ref}
        style={{ display: "flex", gap: 18, overflowX: "auto", padding: "4px clamp(16px,4.5vw,48px) 18px", scrollSnapType: "x mandatory" }}
      >
        {children}
      </div>
      <button type="button" aria-label="次のスケジュール" className="sched-arrow sched-arrow--right" onClick={() => scroll(1)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 5 16 12 9 19" /></svg>
      </button>
    </div>
  );
}
