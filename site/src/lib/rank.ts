// Format a placement badge for display as an English ordinal.
// CMS stores Japanese ("優勝", "6位", …); admin input stays Japanese.
// 優勝→1st, 準優勝→2nd, N位→Nth. Non-placement labels (ベスト4, 予選敗退,
// 欠場, …) are returned unchanged.
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function rankLabel(badge?: string): string {
  if (!badge) return "";
  const t = badge.trim();
  if (t === "優勝") return "1st";
  if (t === "準優勝") return "2nd";
  const jp = t.match(/^(\d+)\s*位$/);
  if (jp) return ordinal(parseInt(jp[1], 10));
  const en = t.match(/^(\d+)(st|nd|rd|th)$/i);
  if (en) return ordinal(parseInt(en[1], 10));
  return t;
}
