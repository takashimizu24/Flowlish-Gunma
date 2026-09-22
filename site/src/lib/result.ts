// Per-game outcome, including walkovers (不戦勝 / 不戦敗).
//
// `scores` is free text in microCMS, so a game's outcome can arrive three ways:
//   1. the `result` the admin form writes ("Win" / "Lose" / "WO-Win" / "WO-Lose")
//   2. a walkover typed straight into the CMS as a score ("W-0" / "0-W")
//   3. a plain numeric score with no usable `result`
// Anything that matches none of these stays unknown ("") — callers drop the
// chip instead of falling back to LOSE.

export type Outcome = "win" | "lose" | "wo-win" | "wo-lose" | "";

/** A score side that marks a walkover instead of carrying points. */
const WIN_MARK = /^(w|wo|○|◯|勝|不戦勝)$/i;
const LOSE_MARK = /^(l|lo|×|✕|x|敗|負|不戦敗)$/i;

function fromResult(raw: string): Outcome {
  const r = raw.trim().toLowerCase().replace(/[\s_.-]/g, "");
  if (!r) return "";
  if (["wowin", "walkoverwin", "forfeitwin", "不戦勝"].includes(r)) return "wo-win";
  if (["wolose", "woloss", "walkoverlose", "forfeitlose", "forfeitloss", "不戦敗"].includes(r)) return "wo-lose";
  if (["win", "w", "勝", "勝ち"].includes(r)) return "win";
  if (["lose", "loss", "l", "敗", "負け"].includes(r)) return "lose";
  return "";
}

/** A walkover marker in the score ("W-0") — a deliberate hand-typed notation. */
function walkoverFromScore(raw: string): Outcome {
  const [a, b] = raw.split("-").map((s) => s.trim());
  if (a === undefined || b === undefined) return "";
  if (WIN_MARK.test(a) || LOSE_MARK.test(b)) return "wo-win";
  if (WIN_MARK.test(b) || LOSE_MARK.test(a)) return "wo-lose";
  return "";
}

function fromScore(raw: string): Outcome {
  const [a, b] = raw.split("-").map((s) => s.trim());
  if (a === undefined || b === undefined) return "";
  const my = Number(a);
  const their = Number(b);
  if (a === "" || b === "" || !Number.isFinite(my) || !Number.isFinite(their)) return "";
  if (my === their) return ""; // no draws in 3x3 — treat as not yet recorded
  return my > their ? "win" : "lose";
}

/** Outcome of one game.
 *  A walkover marker in the score is checked first: it is always hand-typed on
 *  purpose, while a stale `result` may have been derived from that same
 *  unparseable score (which is what made 不戦勝 show up as LOSE). */
export function gameOutcome(g: { score?: string; result?: string }): Outcome {
  return walkoverFromScore(g.score ?? "") || fromResult(g.result ?? "") || fromScore(g.score ?? "");
}

export const isWin = (o: Outcome) => o === "win" || o === "wo-win";
export const isWalkover = (o: Outcome) => o === "wo-win" || o === "wo-lose";

/** Chip text. Walkovers are spelled out so they read differently from a played game. */
export const OUTCOME_LABEL: Record<Exclude<Outcome, "">, string> = {
  win: "WIN",
  lose: "LOSE",
  "wo-win": "不戦勝",
  "wo-lose": "不戦敗",
};

/** What gets stored in the microCMS `scores` JSON. */
export const RESULT_VALUE: Record<Outcome, string> = {
  win: "Win",
  lose: "Lose",
  "wo-win": "WO-Win",
  "wo-lose": "WO-Lose",
  "": "",
};

/** Score string stored for a walkover. */
export const WALKOVER_SCORE = { win: "W-0", lose: "0-W" } as const;
