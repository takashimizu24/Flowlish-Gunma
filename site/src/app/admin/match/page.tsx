import { getPlayers } from "@/lib/api";
import MatchForm from "./MatchForm";

export const dynamic = "force-dynamic";

export default async function AdminMatchPage() {
  const players = await getPlayers();
  const opts = players.map((p) => ({ id: p.id, number: p.number, nameEn: p.nameEn }));
  return <MatchForm players={opts} />;
}
