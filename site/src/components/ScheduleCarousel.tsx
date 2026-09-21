"use client";

import { useRef, useState, useCallback, Children } from "react";

/** Horizontal schedule carousel: arrows on desktop/tablet, dot pagination on mobile. */
export default function ScheduleCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const count = Children.count(children);
  const [active, setActive] = useState(0);

  const scroll = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 448), behavior: "smooth" });
  };

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const er = el.getBoundingClientRect();
    let best = 0, bestD = Infinity;
    Array.from(el.children).forEach((k, i) => {
      const d = Math.abs(k.getBoundingClientRect().left - er.left - pad);
      if (d < bestD) { bestD = d; best = i; }
    });
    setActive(best);
  }, []);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const k = el.children[i] as HTMLElement | undefined;
    if (!k) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    el.scrollTo({ left: el.scrollLeft + (k.getBoundingClientRect().left - el.getBoundingClientRect().left - pad), behavior: "smooth" });
  };

  // left inset = the container's content-left edge, so the first card aligns with
  // the heading/other sections while the track still bleeds full-width to the right.
  const insetStyle = { "--sched-inset": "calc(max(0px, (100vw - 1200px) / 2) + clamp(16px, 4.5vw, 56px))" } as React.CSSProperties;

  return (
    <div style={{ position: "relative", ...insetStyle }}>
      {/* track wrapper: arrows anchor here so they center on the CARD, not the dots */}
      <div style={{ position: "relative" }}>
        <button type="button" aria-label="前のスケジュール" className="sched-arrow sched-arrow--left" onClick={() => scroll(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 5 8 12 15 19" /></svg>
        </button>
        <div
          ref={ref}
          onScroll={onScroll}
          className="sched-track"
          style={{ display: "flex", overflowX: "auto", paddingTop: 4, paddingBottom: 10, paddingLeft: "var(--sched-inset)", paddingRight: "clamp(16px,4.5vw,48px)", scrollPaddingLeft: "var(--sched-inset)", scrollSnapType: "x mandatory" }}
        >
          {children}
        </div>
        <button type="button" aria-label="次のスケジュール" className="sched-arrow sched-arrow--right" onClick={() => scroll(1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 5 16 12 9 19" /></svg>
        </button>
      </div>
      {count > 1 && (
        <div className="sched-dots" role="tablist" aria-label="スケジュール切り替え">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}枚目へ`}
              aria-selected={i === active}
              className={"sched-dot" + (i === active ? " is-active" : "")}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
