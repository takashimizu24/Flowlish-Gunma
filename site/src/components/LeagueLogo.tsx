import { leagueLogo } from "@/lib/leagueLogo";

/** Competition logo, fitted (contain) into the `.lg-logo` box; nothing when the league has none. */
export default function LeagueLogo({ league }: { league?: string }) {
  const logo = leagueLogo(league);
  if (!logo) return null;
  return <img className="lg-logo" src={logo.src} alt={league} width={Math.round(40 * logo.ratio)} height={40} />;
}
