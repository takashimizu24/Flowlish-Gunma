// Latest videos from the team's YouTube channel via the public RSS feed
// (no API key needed). The channel id is resolved from the @handle once and
// cached; override with env YOUTUBE_CHANNEL_ID. Returns [] on any failure.

export type Video = { id: string; title: string; date: string; thumb: string };

const HANDLE = process.env.YOUTUBE_HANDLE || "flowlish3x3";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(+n));

async function channelId(): Promise<string | null> {
  if (process.env.YOUTUBE_CHANNEL_ID) return process.env.YOUTUBE_CHANNEL_ID;
  try {
    const r = await fetch(`https://www.youtube.com/@${HANDLE}`, {
      headers: { "user-agent": UA, "accept-language": "ja,en;q=0.8" },
      next: { revalidate: 86400 },
    });
    if (!r.ok) return null;
    const html = await r.text();
    const m = html.match(/"channelId":"(UC[\w-]+)"/) || html.match(/\/channel\/(UC[\w-]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

// A Short's /shorts/<id> URL returns 200; a normal video redirects (30x) to /watch.
async function isShort(id: string): Promise<boolean> {
  try {
    const r = await fetch(`https://www.youtube.com/shorts/${id}`, {
      method: "HEAD",
      redirect: "manual",
      headers: { "user-agent": UA },
      next: { revalidate: 86400 },
    });
    return r.status === 200;
  } catch {
    return false;
  }
}

export async function getVideos(max = 5): Promise<Video[]> {
  try {
    const cid = await channelId();
    if (!cid) return [];
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${cid}`, {
      headers: { "user-agent": UA },
      next: { revalidate: 3600 },
    });
    if (!r.ok) return [];
    const xml = await r.text();
    const all = xml
      .split("<entry>")
      .slice(1)
      .map((e) => {
        const id = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || "";
        const title = decode(e.match(/<(?:media:)?title[^>]*>([^<]*)<\/(?:media:)?title>/)?.[1] || "");
        const date = e.match(/<published>([^<]+)<\/published>/)?.[1] || "";
        const thumb = e.match(/<media:thumbnail url="([^"]+)"/)?.[1] || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "");
        return { id, title, date, thumb };
      })
      .filter((v) => v.id);
    // exclude Shorts
    const shorts = await Promise.all(all.map((v) => isShort(v.id)));
    return all.filter((_, i) => !shorts[i]).slice(0, max);
  } catch {
    return [];
  }
}
