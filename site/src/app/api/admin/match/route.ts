import { NextResponse } from "next/server";
import { gameOutcome, RESULT_VALUE, WALKOVER_SCORE } from "@/lib/result";

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;

type GameInput = { phase: string; opp: string; myScore: string; oppScore: string; walkover?: "" | "win" | "lose" };

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
  // A walkover (不戦勝 / 不戦敗) has no points: it is stored as "W-0" / "0-W"
  // and the outcome is derived from the score, same as a played game.
  const parsedGames = games.map((g) => {
    const score =
      g.walkover === "win" || g.walkover === "lose"
        ? WALKOVER_SCORE[g.walkover]
        : `${g.myScore}-${g.oppScore}`;
    return { phase: g.phase || "", opp: g.opp, score, result: RESULT_VALUE[gameOutcome({ score })] };
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
    memo: b.memo || "",
    eventUrl: b.eventUrl || "",
    fibaEventUrl: b.fibaEventUrl || "",
    liveUrl: b.liveUrl || "",
  };
  if (b.date) payload.date = new Date(b.date).toISOString();

  const editing = typeof b.id === "string" && b.id;
  const r = await fetch(
    `https://${DOMAIN}.microcms.io/api/v1/matches${editing ? `/${b.id}` : ""}`,
    {
      method: editing ? "PATCH" : "POST",
      headers: { "X-MICROCMS-API-KEY": KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: data?.message || "保存に失敗しました" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id: data.id || b.id });
}
