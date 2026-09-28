import { leagueLabel } from "@/lib/match";
import type { Match } from "@/lib/types";

/**
 * League + year, e.g. "3x3.EXE PREMIER 2026".
 * The surrounding text is styled uppercase (text-transform) for the design, but
 * "3x3" must keep its lowercase x — so each "3x3" is rendered in a span that
 * opts out of the transform.
 */
// Render text keeping every "3x3" lowercase even inside an uppercase context.
export function Keep3x3({ text }: { text: string }) {
  const parts = text.split(/(3x3)/i);
  return <>{parts.map((p, i) => (/^3x3$/i.test(p) ? <span key={i} style={{ textTransform: "none" }}>3x3</span> : p))}</>;
}

export function LeagueLabel({ m }: { m: Pick<Match, "league" | "year" | "date" | "round"> }) {
  return <Keep3x3 text={leagueLabel(m)} />;
}
