/**
 * Dates formatted in JST. Vercel runs in UTC, so formatting with the runtime's
 * timezone would shift dates by a day; everything here pins Asia/Tokyo.
 */
const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** {y, m, d} in JST, or null for a missing/invalid date. */
export function jstParts(iso?: string): { y: number; m: number; d: number } | null {
  if (!iso) return null;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return null;
  const [y, m, d] = parts.format(dt).split("-").map(Number);
  return { y, m, d };
}

/** "2026/9/5" */
export function ymdSlash(iso?: string): string {
  const p = jstParts(iso);
  return p ? `${p.y}/${p.m}/${p.d}` : "";
}
