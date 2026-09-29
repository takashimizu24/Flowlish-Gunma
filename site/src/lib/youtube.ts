/**
 * YouTube チャンネルの最新動画。
 *
 * 公開フィード（`/feeds/videos.xml`）を読むだけなので、APIキーも microCMS の
 * 枠も使わない。チャンネルに投稿すればサイト側は勝手に新しくなる。
 * 返るのは最新15本まで（YouTube 側の仕様）。
 */

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

/**
 * 最新動画を取得する。取れなかったときは空配列を返し、セクションごと隠す。
 * （YouTube が落ちていてもトップページは出したい）
 */
export async function getChannelVideos(channelId: string, limit = 5): Promise<Video[]> {
  if (!channelId) return [];
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
      { next: { revalidate: 3600 } } // 1時間キャッシュ。投稿の反映はこの間隔。
    );
    if (!res.ok) return [];
    const xml = await res.text();

    const videos: Video[] = [];
    for (const entry of xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []) {
      const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1];
      if (!id || !title) continue;
      // Shorts は縦長で一覧に合わないので外す。フィード上はリンクが /shorts/ になる。
      if (/<link[^>]+href="[^"]*\/shorts\//.test(entry)) continue;
      videos.push({
        id,
        title: decode(title).trim(),
        published: published ?? "",
        url: `https://www.youtube.com/watch?v=${id}`,
      });
      if (videos.length >= limit) break;
    }
    return videos;
  } catch {
    return [];
  }
}
