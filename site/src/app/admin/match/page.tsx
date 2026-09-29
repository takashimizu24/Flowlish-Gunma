import { getAllPlayers, getMatches } from "@/lib/api";
import MatchForm from "./MatchForm";
import { matchSeason, seasonStart } from "@/lib/match";

export const dynamic = "force-dynamic";

export default async function AdminMatchPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const [players, matches] = await Promise.all([getAllPlayers(), getMatches(100)]);
  const opts = players.map((p) => ({ id: p.id, number: p.number, nameEn: p.nameEn, active: p.active !== false }));
  const editing = id ? matches.find((m) => m.id === id) ?? null : null;
  const list = matches
    .map((m) => ({ id: m.id, league: [m.leagueSponsor, m.league].filter(Boolean).join(" "), year: m.year, season: matchSeason(m), round: m.round ?? "", dateLabel: m.dateLabel || "", date: m.date ?? "" }))
    .sort((a, b) => seasonStart(b.season) - seasonStart(a.season) || (b.date || "").localeCompare(a.date || ""));
  // suggestions keep names consistent — a typo'd league would split the site's league filter
  const uniq = (xs: (string | undefined)[]) => [...new Set(xs.map((x) => (x || "").trim()).filter(Boolean))].sort();
  const leagues = uniq(matches.map((m) => m.league));
  const sponsors = uniq(matches.map((m) => m.leagueSponsor));
  return <MatchForm players={opts} matches={list} leagues={leagues} sponsors={sponsors} editing={editing} />;
}
