"use client";

import NavDrop from "./NavDrop";

// Items under the header's TEAM. Add STAFF here once its page exists.
const ITEMS = [
  { label: "PLAYERS", sub: "選手紹介", href: "/#roster" },
  { label: "COMPANY", sub: "会社概要", href: "/company" },
];

/** Header nav "TEAM": players and the company profile. */
export default function TeamMenu({ linkStyle }: { linkStyle: React.CSSProperties }) {
  return (
    <NavDrop label="TEAM" href="/#roster" linkStyle={linkStyle}>
      <div className="nav-drop-cols nav-drop-cols--single">
        <div>
          {ITEMS.map((i) => (
            <a key={i.href} role="menuitem" href={i.href} className="nav-drop-link">
              {i.label}<b>{i.sub}</b>
            </a>
          ))}
        </div>
      </div>
    </NavDrop>
  );
}
