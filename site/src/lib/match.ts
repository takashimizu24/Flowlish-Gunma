import type { Match } from "./types";

// Season year — prefer the explicit `year` field, then the date, then a leading
// 4-digit year baked into the round string (legacy data like "2026 ROUND.8").
export function matchYear(m: Pick<Match, "year" | "date" | "round">): string {
  if (m.year) return String(m.year);
  if (m.date) return String(new Date(m.date).getFullYear());
  const mm = (m.round || "").match(/^(\d{4})\b/);
  return mm ? mm[1] : "";
}

// Season (e.g. "2025-26") runs April -> March, so autumn qualifiers and the
// winter finals of the same competition land in one season. A match can
// override it with the `season` field when a tournament sits outside that window.
export const SEASON_START_MONTH = 4;
const SEASON_RE = /^(\d{4})-(\d{2})$/;

export const seasonOf = (startYear: number) => `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

export function seasonForDate(d: Date): string {
  const jst = new Date(d.getTime() + 9 * 3600 * 1000);
  const y = jst.getUTCFullYear();
  return seasonOf(jst.getUTCMonth() + 1 >= SEASON_START_MONTH ? y : y - 1);
}

export function matchSeason(m: Pick<Match, "season" | "year" | "date" | "round">): string {
  const s = (m.season || "").trim();
  if (SEASON_RE.test(s)) return s;
  if (m.date) return seasonForDate(new Date(m.date));
  const y = Number(matchYear(m));
  return y ? seasonOf(y) : "";
}

export const currentSeason = () => seasonForDate(new Date());

// "2025-26" -> 2025 (for sorting)
export const seasonStart = (s: string) => Number((s.match(SEASON_RE) || [])[1] || 0);

// Round title without the leading year prefix ("2026 ROUND.8" -> "ROUND.8").
export function roundTitle(m: Pick<Match, "round">): string {
  return (m.round || "").replace(/^\d{4}\s+/, "").trim();
}

// contains Japanese (kana / kanji / fullwidth) — such text needs different
// typography than the Latin all-caps titles.
export const hasJP = (s?: string) => !!s && /[぀-ヿ㐀-鿿ｦ-ﾟ]/.test(s);

// A single-shot tournament lacks the league+round pair (either the league or the
// round is empty) — show the remaining name big, with no small league line.
export function isSingle(m: Pick<Match, "round" | "league">): boolean {
  return !((m.league || "").trim() && roundTitle(m));
}

// The big title: the round if present, otherwise the league (event) name.
export function matchTitle(m: Pick<Match, "round" | "league">): string {
  return roundTitle(m) || (m.league || "").trim();
}

// Tournaments shown with their edition (第N回) instead of the year.
// base: championship-year - base = edition (e.g. 2024 -> 第9回).
const EDITION: Record<string, number> = { "3x3 日本選手権": 2015 };

// League + year as one label ("3x3.EXE PREMIER 2026"). For editioned tournaments
// the edition replaces the year ("第11回 3x3日本選手権").
export function leagueLabel(m: Pick<Match, "league" | "year" | "date" | "round">): string {
  const base = m.league ? EDITION[m.league] : undefined;
  if (base !== undefined) {
    const y = Number(matchYear(m));
    // qualifiers (県予選) run in Nov of the previous year -> championship is year+1
    const champYear = y && (m.round || "").includes("予選") ? y + 1 : y;
    const ed = champYear ? champYear - base : 0;
    if (ed >= 1) return `第${ed}回 ${m.league}`;
  }
  return [m.league, matchYear(m)].filter(Boolean).join(" ");
}
