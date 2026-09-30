/**
 * YouTube チャンネルの最新動画。
 *
 * 公開フィード（`/feeds/videos.xml`）を読むだけなので、APIキーも microCMS の
 * 枠も使わない。チャンネルに投稿すればサイト側は勝手に新しくなる。
 * 返るのは最新15本まで（YouTube 側の仕様）。
 */

import { unstable_cache } from "next/cache";
import { VIDEO_FALLBACK } from "./videoFallback";

export type Video = {
  id: string;
  title: string;
  published: string;
  url: string;
};

/** RSS は実体参照が入るので、使うものだけ戻す。 */
function decode(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * サムネイル。`maxresdefault` は HD 以外の動画には存在しないので、
 * 背景画像として2枚重ね、無いときは下の `hqdefault` が出るようにする。
 * どちらも 16:9 で cover すると、hqdefault の上下の黒帯がちょうど切れる。
 */
export function thumbLayers(id: string): string {
  return `url(https://i.ytimg.com/vi/${id}/maxresdefault.jpg), url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
}

/** フィードを取得してパースする。失敗・空のときは例外（キャッシュさせないため）。 */
async function fetchFeed(channelId: string, limit: number): Promise<Video[]> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`YouTube feed ${res.status}`);
  const xml = await res.text();

  const videos: Video[] = [];
  for (const entry of xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []) {
    const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1];
    if (!id || !title) continue;
    // Shorts は縦長で一覧に合わないので外す。フィード上はリンクが /shorts/ になる。
    if (/<link[^>]+href="[^"]*\/shorts\//.test(entry)) continue;
    videos.push({ id, title: decode(title).trim(), published: published ?? "", url: `https://www.youtube.com/watch?v=${id}` });
    if (videos.length >= limit) break;
  }
  if (videos.length === 0) throw new Error("YouTube feed: no videos");
  return videos;
}

// 1時間キャッシュ（投稿の反映はこの間隔）。成功した一覧だけが保存され、その後の取得が
// 失敗しても（YouTube のフィードは 404/500 を返す障害がある）保存済みの一覧を出し続ける。
const cachedFeed = unstable_cache(fetchFeed, ["youtube-feed"], { revalidate: 3600 });

/**
 * 最新動画を取得する。フィードが一度も取れていないときは控えの一覧（videoFallback.ts）を使い、
 * それもなければ空配列を返してセクションごと隠す。
 */
export async function getChannelVideos(channelId: string, limit = 5): Promise<Video[]> {
  if (!channelId) return [];
  try {
    return await cachedFeed(channelId, limit);
  } catch {
    return VIDEO_FALLBACK.slice(0, limit);
  }
}
