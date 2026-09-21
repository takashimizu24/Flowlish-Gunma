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
      <button type="button" aria-label="前のスケジュール" className="sched-arrow sched-arrow--left" onClick={() => scroll(-1)}>‹</button>
      <div
        ref={ref}
        style={{ display: "flex", gap: 18, overflowX: "auto", padding: "4px clamp(16px,4.5vw,48px) 18px", scrollSnapType: "x mandatory" }}
      >
        {children}
      </div>
      <button type="button" aria-label="次のスケジュール" className="sched-arrow sched-arrow--right" onClick={() => scroll(1)}>›</button>
    </div>
  );
}
