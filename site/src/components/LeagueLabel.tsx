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

const JP = /[぀-ヿ㐀-鿿ｦ-ﾟー々〆〜]+/;
// Title renderer: keeps "3x3" lowercase AND renders Japanese runs a touch smaller
// and heavier so they sit visually level with the Latin (Barlow) letters.
export function TitleText({ text }: { text: string }) {
  const tokens = text.split(/(3x3|[぀-ヿ㐀-鿿ｦ-ﾟー々〆〜]+)/i);
  return (
    <>
      {tokens.map((t, i) => {
        if (!t) return null;
        if (/^3x3$/i.test(t)) return <span key={i} style={{ textTransform: "none" }}>3x3</span>;
        if (JP.test(t)) return <span key={i} style={{ fontSize: "0.84em", fontWeight: 900, textTransform: "none" }}>{t}</span>;
        return t;
      })}
    </>
  );
}

export function LeagueLabel({ m }: { m: Pick<Match, "league" | "leagueSponsor" | "year" | "date" | "round" | "season" | "showSeason" | "hideYear"> }) {
  return <TitleText text={leagueLabel(m)} />;
}
