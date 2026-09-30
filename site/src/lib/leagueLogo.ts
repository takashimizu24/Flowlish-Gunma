// Competition logos shown to the left of a match's league/round title.
// Matched on the league name (the title sponsor lives in its own field, so
// "PLCO 3XS" is still league "3XS"). Leagues without a logo show none.
// The Japan Championship mark is our own lettering (the official logo can't be used).

// scale: per-logo visual adjustment on top of the equal-area sizing (1 = as computed)
const LOGOS: { test: RegExp; src: string; ratio: number; scale?: number }[] = [
  { test: /EXE\s*PREMIER/i, src: "/leagues/exe.svg", ratio: 4.05 },
  { test: /\b3XS\b/i, src: "/leagues/3xs.svg", ratio: 2.95, scale: 0.8 },
  { test: /Women'?s\s*Series/i, src: "/leagues/ws.svg", ratio: 1.46 },
  { test: /日本選手権|Japan\s*Championship/i, src: "/leagues/jc.svg", ratio: 1.62 },
  { test: /WKBL|Triple\s*Jam/i, src: "/leagues/wkbl.webp", ratio: 1.086 },
];

export function leagueLogo(league?: string): { src: string; ratio: number; scale: number } | null {
  const l = (league || "").trim();
  if (!l) return null;
  const hit = LOGOS.find((x) => x.test.test(l));
  return hit ? { src: hit.src, ratio: hit.ratio, scale: hit.scale ?? 1 } : null;
}
