import type { Match } from "./types";

// Season year — prefer the explicit `year` field, then the date, then a leading
// 4-digit year baked into the round string (legacy data like "2026 ROUND.8").
export function matchYear(m: Pick<Match, "year" | "date" | "round">): string {
  if (m.year) return String(m.year);
  if (m.date) return String(new Date(m.date).getFullYear());
  const mm = (m.round || "").match(/^(\d{4})\b/);
  return mm ? mm[1] : "";
}

// Round title without the leading year prefix ("2026 ROUND.8" -> "ROUND.8").
export function roundTitle(m: Pick<Match, "round">): string {
  return (m.round || "").replace(/^\d{4}\s+/, "").trim();
}
