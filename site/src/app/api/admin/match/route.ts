import { NextResponse } from "next/server";

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;

type GameInput = { phase: string; opp: string; myScore: string; oppScore: string; wo?: "" | "win" | "lose" };

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
  const leagueIn = String(b?.league ?? "").trim();
  const roundIn = String(b?.round ?? "").trim();
  if (!b || (!leagueIn && !roundIn)) {
    return NextResponse.json({ ok: false, error: "リーグ名かラウンド名のどちらかは必須です" }, { status: 400 });
  }

  const games = (b.games as GameInput[] | undefined)?.filter((g) => g && g.opp) ?? [];
  const parsedGames = games.map((g) => {
    // walkover (不戦勝/不戦敗): no numeric score
    if (g.wo === "win") return { phase: g.phase || "", opp: g.opp, score: "W-0", result: "WO-Win" };
    if (g.wo === "lose") return { phase: g.phase || "", opp: g.opp, score: "0-W", result: "WO-Lose" };
    const my = Number(g.myScore);
    const their = Number(g.oppScore);
    const result = Number.isFinite(my) && Number.isFinite(their) ? (my > their ? "Win" : "Lose") : "";
    return { phase: g.phase || "", opp: g.opp, score: `${g.myScore}-${g.oppScore}`, result };
  });

  // Round is stored without a year — the season/year is derived from the date and
  // shown next to the league name. Strip any legacy "2026 " prefix that slips in.
  const round = roundIn.replace(/^\d{4}\s+/, "");

  const yearNum = Number(b.year);
  const payload: Record<string, unknown> = {
    league: leagueIn,
    year: Number.isFinite(yearNum) && yearNum > 0 ? yearNum : (b.date ? new Date(b.date).getFullYear() : undefined),
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
