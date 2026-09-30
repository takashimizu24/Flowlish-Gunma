"use client";

import NavDrop from "./NavDrop";

type Item = { label: string; href: string; count: number };

/** Header nav "SCHEDULE" with filtered schedule links (upcoming, each season, main leagues). */
export default function ScheduleMenu({ linkStyle, upcoming, seasons, leagues }: {
  linkStyle: React.CSSProperties; upcoming: number; seasons: Item[]; leagues: Item[];
}) {
  return (
    <NavDrop label="SCHEDULE" href="/schedule" linkStyle={linkStyle}>
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
    </NavDrop>
  );
}
