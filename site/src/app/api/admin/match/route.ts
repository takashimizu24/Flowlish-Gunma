import { NextResponse } from "next/server";

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;

type GameInput = { phase: string; opp: string; myScore: string; oppScore: string };

// "2026.8.8" from an ISO/date string
function ymd(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}.${dt.getMonth() + 1}.${dt.getDate()}`;
}

export async function POST(req: Request) {
  if (!DOMAIN || !KEY) {
    return NextResponse.json({ ok: false, error: "CMS未設定" }, { status: 500 });
  }
  const b = await req.json().catch(() => null);
  if (!b || !b.round) {
    return NextResponse.json({ ok: false, error: "ラウンドは必須です" }, { status: 400 });
  }

  const games = (b.games as GameInput[] | undefined)?.filter((g) => g && g.opp) ?? [];
  const parsedGames = games.map((g) => {
    const my = Number(g.myScore);
    const their = Number(g.oppScore);
    const result = Number.isFinite(my) && Number.isFinite(their) ? (my > their ? "Win" : "Lose") : "";
    return { phase: g.phase || "", opp: g.opp, score: `${g.myScore}-${g.oppScore}`, result };
  });

  // Prefix the year (from the date) onto the round so seasons stay distinct,
  // e.g. "ROUND.8" -> "2026 ROUND.8". Skip if already year-prefixed.
  let round = String(b.round).trim();
  if (b.date && !/^\d{4}\s/.test(round)) {
    round = `${new Date(b.date).getFullYear()} ${round}`;
  }

  const payload: Record<string, unknown> = {
    league: b.league || "3x3.EXE PREMIER",
    round,
    venue: b.venue || "",
    status: b.status || "",
    resultBadge: b.resultBadge || "",
    dateLabel: b.dateLabel || (b.date ? ymd(b.date) : ""),
    scores: parsedGames.length ? JSON.stringify({ games: parsedGames }) : "",
    entryPlayers: Array.isArray(b.entryPlayers) ? b.entryPlayers : [],
  };
  if (b.date) payload.date = new Date(b.date).toISOString();

  const r = await fetch(`https://${DOMAIN}.microcms.io/api/v1/matches`, {
    method: "POST",
    headers: { "X-MICROCMS-API-KEY": KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: data?.message || "保存に失敗しました" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
