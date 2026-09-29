"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * One line of text at `max` px. If it would wrap, the font shrinks just enough to
 * fit on one line — but never below `min`; when even `min` can't fit (narrow
 * phone cards) it keeps `max` and wraps as normal text.
 */
export default function FitLine({ max, min, style, children }: { max: number; min: number; style?: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ size: number; oneLine: boolean }>({ size: max, oneLine: false });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      // measure the natural one-line width at the max size, then put React's styles back
      const prev = { fontSize: el.style.fontSize, whiteSpace: el.style.whiteSpace };
      el.style.fontSize = `${max}px`;
      el.style.whiteSpace = "nowrap";
      const need = el.scrollWidth, have = el.clientWidth;
      el.style.fontSize = prev.fontSize;
      el.style.whiteSpace = prev.whiteSpace;
      if (need <= have) return setFit({ size: max, oneLine: true });
      const size = Math.floor(((max * have) / need) * 10) / 10;
      setFit(size >= min ? { size, oneLine: true } : { size: max, oneLine: false });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure); // web font swaps change the width
    return () => ro.disconnect();
  }, [max, min]);

  return (
    <div ref={ref} style={{ ...style, fontSize: fit.size, whiteSpace: fit.oneLine ? "nowrap" : "normal" }}>
      {children}
    </div>
  );
}
