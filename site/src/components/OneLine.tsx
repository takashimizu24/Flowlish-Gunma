"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Text that is shown only when it fits on a single line; if it would wrap, the whole
 * line is hidden (no ellipsis). Re-checked when the container width changes.
 */
export default function OneLine({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const check = () => {
      const prev = el.style.display;
      el.style.display = "block"; // measure even while hidden
      const ok = el.scrollWidth <= el.clientWidth + 0.5;
      el.style.display = prev;
      setFits(ok);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(parent);
    window.addEventListener("resize", check);
    document.fonts?.ready.then(check);
    return () => { ro.disconnect(); window.removeEventListener("resize", check); };
  }, []);

  return (
    <div ref={ref} style={{ ...style, whiteSpace: "nowrap", overflow: "hidden", display: fits ? "block" : "none" }}>
      {children}
    </div>
  );
}
