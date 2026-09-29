import { leagueLogo } from "@/lib/leagueLogo";

// Logos differ a lot in shape (EXE ≈ 4:1, Women's Series ≈ 1.5:1). Sizing each to the
// same *area* (capped in height) makes them read as the same visual weight; the width
// then follows the logo, so each one sits flush left.
const SIZES = {
  card: { pc: { area: 3400, maxH: 50 }, sp: { area: 2500, maxH: 42 } }, // home cards
  list: { pc: { area: 4600, maxH: 58 }, sp: { area: 2600, maxH: 42 } }, // schedule page
};
const h = (ratio: number, s: { area: number; maxH: number }) => Math.min(s.maxH, Math.round(Math.sqrt(s.area / ratio)));

/** Competition logo; nothing when the league has none. Height per breakpoint via --lh / --lh-sp. */
export default function LeagueLogo({ league, size = "card" }: { league?: string; size?: keyof typeof SIZES }) {
  const logo = leagueLogo(league);
  if (!logo) return null;
  const s = SIZES[size];
  const style = { "--lh": `${h(logo.ratio, s.pc)}px`, "--lh-sp": `${h(logo.ratio, s.sp)}px` } as React.CSSProperties;
  return <img className="lg-logo" src={logo.src} alt={league} width={Math.round(40 * logo.ratio)} height={40} style={style} />;
}
