import { getAllPlayers } from "@/lib/api";
import PlayerForm from "./PlayerForm";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const players = await getAllPlayers();
  const editing = id ? players.find((p) => p.id === id) ?? null : null;
  const list = players.map((p) => ({ id: p.id, nameJa: p.nameJa, number: p.number, active: p.active !== false }));
  return <PlayerForm players={list} editing={editing} />;
}
