"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A header nav item with a drop-down panel. Opens on hover with a mouse; on touch
 * screens the first tap opens it instead of navigating; keyboard focus opens it too.
 * Closes on an outside tap/click, on Escape, or when focus leaves it.
 */
export default function NavDrop({ label, href, linkStyle, children }: {
  label: string; href: string; linkStyle: React.CSSProperties; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); };
  const hideSoon = () => { closeTimer.current = setTimeout(() => setOpen(false), 140); };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const hoverable = () => window.matchMedia("(hover: hover)").matches;

  return (
    <div ref={ref} className="nav-drop" onMouseEnter={() => hoverable() && show()} onMouseLeave={() => hoverable() && hideSoon()}
      // keyboard focus only — a tap also focuses the link, which must not pre-open it
      onFocus={(e) => { if ((e.target as HTMLElement).matches(":focus-visible")) show(); }}
      onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <a href={href} aria-haspopup="true" aria-expanded={open} className="nav-link" style={linkStyle}
        onClick={(e) => { if (!hoverable() && !open) { e.preventDefault(); setOpen(true); } }}>
        {label}
        <svg className="nav-drop-caret" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none" }}><polyline points="6 9 12 15 18 9" /></svg>
      </a>
      {open && <div className="nav-drop-panel" role="menu">{children}</div>}
    </div>
  );
}
