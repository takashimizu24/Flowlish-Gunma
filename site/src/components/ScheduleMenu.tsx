"use client";

import { useEffect, useRef, useState } from "react";

type Item = { label: string; href: string; count: number };

/**
 * Header nav "SCHEDULE" with a drop-down of filtered schedule links (upcoming,
 * each season, each league). Opens on hover with a mouse; on touch screens the
 * first tap opens it instead of navigating. Keyboard focus opens it too.
 */
export default function ScheduleMenu({ linkStyle, upcoming, seasons, leagues }: {
  linkStyle: React.CSSProperties; upcoming: number; seasons: Item[]; leagues: Item[];
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
      onFocus={(e) => { if ((e.target as HTMLElement).matches(":focus-visible")) show(); }} onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <a href="/schedule" aria-haspopup="true" aria-expanded={open} className="nav-link" style={linkStyle}
        onClick={(e) => { if (!hoverable() && !open) { e.preventDefault(); setOpen(true); } }}>
        SCHEDULE
        <svg className="nav-drop-caret" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none" }}><polyline points="6 9 12 15 18 9" /></svg>
      </a>
      {open && (
        <div className="nav-drop-panel" role="menu">
          <div className="nav-drop-cols">
            <div>
              <div className="nav-drop-head">試合</div>
              <a role="menuitem" href="/schedule?view=upcoming" className="nav-drop-link nav-drop-link--hot">今後の予定{upcoming ? <b>{upcoming}</b> : null}</a>
              <a role="menuitem" href="/schedule" className="nav-drop-link">すべての試合</a>
              <div className="nav-drop-head">シーズン</div>
              {seasons.map((s) => <a key={s.href} role="menuitem" href={s.href} className="nav-drop-link">{s.label}<b>{s.count}</b></a>)}
            </div>
            <div>
              <div className="nav-drop-head">リーグ</div>
              {leagues.map((l) => <a key={l.href} role="menuitem" href={l.href} className="nav-drop-link">{l.label}<b>{l.count}</b></a>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
