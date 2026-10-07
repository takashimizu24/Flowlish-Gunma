import type { Match } from "./types";

// Season year — prefer the explicit `year` field, then the date, then a leading
// 4-digit year baked into the round string (legacy data like "2026 ROUND.8").
export function matchYear(m: Pick<Match, "year" | "date" | "round">): string {
  if (m.year) return String(m.year);
  if (m.date) return String(new Date(new Date(m.date).getTime() + 9 * 3600 * 1000).getUTCFullYear()); // JST
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

// A game without a result is scheduled (opponent known, not played yet).
export function playedGames(scores?: string): number {
  try {
    const games = JSON.parse(scores || "{}").games;
    return Array.isArray(games) ? games.filter((g: { result?: string }) => !!(g?.result || "").trim()).length : 0;
  } catch {
    return 0;
  }
}

// Not played yet: no result status, or a result with neither a placing nor any played game.
export function isUpcoming(m: Pick<Match, "status" | "resultBadge" | "scores">): boolean {
  return m.status !== "結果" || (!m.resultBadge && playedGames(m.scores) === 0);
}

// Entry players in display order: current roster first, then former players,
// each by jersey number (lowest first).
export function sortEntry<P extends { active?: boolean; number?: number }>(players: P[] = []): P[] {
  const rank = (p: P) => (p.active === false ? 1 : 0);
  return [...players].sort((a, b) => rank(a) - rank(b) || (a.number ?? 999) - (b.number ?? 999));
}

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

// ---- League line: its parts and their order -------------------------------------------
// The line above the round is built from up to five parts — sponsor, league, other (an
// edition like "11th"), year, season — in an order set per match (`titleOrder`). Only
// `league` is what the schedule filter groups by, so "11th" / "PLCO" never split a league.
export type TitlePart = "sponsor" | "league" | "extra" | "year" | "season";
export const TITLE_PARTS: TitlePart[] = ["sponsor", "league", "extra", "year", "season"];
export type TitleSlot = { part: TitlePart; on: boolean };

export type LabelFields = Pick<Match, "league" | "leagueSponsor" | "leagueExtra" | "titleOrder" | "year" | "date" | "round" | "season" | "showSeason" | "hideYear">;

// Stored as "extra league year -season -sponsor": the order, with "-" marking a hidden part
// (it keeps its place so turning it back on puts it where it was).
export function parseTitleOrder(s?: string): TitleSlot[] | null {
  const toks = (s || "").trim().split(/[\s,]+/).filter(Boolean);
  const slots: TitleSlot[] = [];
  for (const t of toks) {
    const part = t.replace(/^-/, "") as TitlePart;
    if (TITLE_PARTS.includes(part) && !slots.some((x) => x.part === part)) slots.push({ part, on: !t.startsWith("-") });
  }
  return slots.length ? slots : null;
}
export const serializeTitleOrder = (slots: TitleSlot[]) => slots.map((x) => (x.on ? "" : "-") + x.part).join(" ");

// The order + visibility a match uses. Without `titleOrder` it is the old layout:
// sponsor, league, other, then the year or the season (showSeason / hideYear).
export function titleSlots(m: Pick<Match, "titleOrder" | "showSeason" | "hideYear">): TitleSlot[] {
  const parsed = parseTitleOrder(m.titleOrder);
  if (parsed) {
    // parts missing from an older stored order: the date parts hidden, the names shown
    for (const part of TITLE_PARTS) if (!parsed.some((x) => x.part === part)) parsed.push({ part, on: part !== "year" && part !== "season" });
    return parsed;
  }
  return [
    { part: "sponsor", on: true },
    { part: "league", on: true },
    { part: "extra", on: true },
    { part: "year", on: !m.hideYear && !m.showSeason },
    { part: "season", on: !m.hideYear && !!m.showSeason },
  ];
}

export function partText(m: LabelFields, part: TitlePart): string {
  if (part === "sponsor") return (m.leagueSponsor || "").trim();
  if (part === "league") return (m.league || "").trim();
  if (part === "extra") return (m.leagueExtra || "").trim();
  if (part === "year") return matchYear(m);
  const s = matchSeason(m);
  return s ? `${s} SEASON` : "";
}

const isDatePart = (p: TitlePart) => p === "year" || p === "season";
const shownParts = (m: LabelFields, keep: (p: TitlePart) => boolean) =>
  titleSlots(m).filter((x) => x.on && keep(x.part)).map((x) => partText(m, x.part)).filter(Boolean).join(" ");

// The name parts only, in order ("PLCO 3XS", "11th 3x3 Japan Championships").
export function leagueName(m: LabelFields): string {
  return shownParts(m, (p) => !isDatePart(p));
}

// The big title: the round if present, otherwise the league (event) name.
export function matchTitle(m: LabelFields): string {
  return roundTitle(m) || leagueName(m);
}

// Tournaments shown with their edition (第N回) instead of the year — legacy data only
// (matches without an "other" part or a set order). base: year - base = edition (2024 -> 第9回).
const EDITION: Record<string, number> = { "3x3 日本選手権": 2015 };

// The year / season parts only — shown alone above a single-event title.
export function yearLabel(m: LabelFields): string {
  return shownParts(m, isDatePart);
}

// The full line, every shown part in order ("3x3.EXE PREMIER 2026", "11th 3x3 Japan Championships").
export function leagueLabel(m: LabelFields): string {
  const base = m.league && !m.leagueExtra && !m.titleOrder ? EDITION[m.league] : undefined;
  if (base !== undefined) {
    const y = Number(matchYear(m));
    // qualifiers (県予選) run in Nov of the previous year -> championship is year+1
    const champYear = y && (m.round || "").includes("予選") ? y + 1 : y;
    const ed = champYear ? champYear - base : 0;
    if (ed >= 1) return `第${ed}回 ${leagueName(m)}`;
  }
  return shownParts(m, () => true);
}
