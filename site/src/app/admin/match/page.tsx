import { getAllPlayers, getMatches } from "@/lib/api";
import MatchForm from "./MatchForm";

export const dynamic = "force-dynamic";

export default async function AdminMatchPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const [players, matches] = await Promise.all([getAllPlayers(), getMatches(100)]);
  const opts = players.map((p) => ({ id: p.id, number: p.number, nameEn: p.nameEn }));
  const editing = id ? matches.find((m) => m.id === id) ?? null : null;
  const list = matches.map((m) => ({ id: m.id, round: m.round ?? "", dateLabel: m.dateLabel || "" }));
  return <MatchForm players={opts} matches={list} editing={editing} />;
}
