import { client } from "./microcms";
import type { Player, News, Match, Partner, TopBanner } from "./types";

/** Current-roster players, ordered by `order` then jersey number.
 *  Former players (active === false) are excluded — they only appear in past
 *  match records. Players without the flag set are treated as current. */
export async function getPlayers(): Promise<Player[]> {
  if (!client) return [];
  const data = await client.getList<Player>({
    endpoint: "players",
    queries: { orders: "order,number", limit: 100 },
  });
  return data.contents.filter((p) => p.active !== false);
}

/** All players incl. former (active === false) — for the admin editor. */
export async function getAllPlayers(): Promise<Player[]> {
  if (!client) return [];
  const data = await client.getList<Player>({
    endpoint: "players",
    queries: { orders: "order,number", limit: 100 },
  });
  return data.contents;
}

/** News, newest first. */
export async function getNews(limit = 6): Promise<News[]> {
  if (!client) return [];
  const data = await client.getList<News>({
    endpoint: "news",
    queries: { orders: "-publishedDate", limit },
  });
  return data.contents;
}

/** A single news item by id (for the detail page). */
export async function getNewsItem(id: string): Promise<News | null> {
  if (!client) return null;
  try {
    return await client.getListDetail<News>({ endpoint: "news", contentId: id });
  } catch {
    return null;
  }
}

/** Matches, newest first (by date). */
export async function getMatches(limit = 20): Promise<Match[]> {
  if (!client) return [];
  const data = await client.getList<Match>({
    endpoint: "matches",
    queries: { orders: "-date", limit, depth: 2 },
  });
  return data.contents;
}

/** Sponsors, ordered by `order`. */
export async function getPartners(): Promise<Partner[]> {
  if (!client) return [];
  const data = await client.getList<Partner>({
    endpoint: "partners",
    queries: { orders: "order", limit: 100 },
  });
  return data.contents;
}

/** Top news-carousel banners, ordered by `order`. */
export async function getBanners(): Promise<TopBanner[]> {
  if (!client) return [];
  const data = await client.getList<TopBanner>({
    endpoint: "banners",
    queries: { orders: "order", limit: 30 },
  });
  return data.contents;
}
