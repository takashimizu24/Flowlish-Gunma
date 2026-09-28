// Latest videos from the team's YouTube channel via the YouTube Data API v3.
// Requires env YOUTUBE_API_KEY. Channel resolved from the @handle (override with
// YOUTUBE_CHANNEL_ID). Returns [] when unset/failing so the UI can fall back.

export type Video = { id: string; title: string; date: string; thumb: string };

const KEY = process.env.YOUTUBE_API_KEY;
const HANDLE = process.env.YOUTUBE_HANDLE || "flowlish3x3";

type YTThumb = { url: string };
type YTItem = { snippet: { title: string; publishedAt: string; resourceId?: { videoId?: string }; thumbnails: Record<string, YTThumb | undefined> } };

async function uploadsPlaylistId(): Promise<string | null> {
  const cid = process.env.YOUTUBE_CHANNEL_ID;
  if (cid) return "UU" + cid.replace(/^UC/, "");
  const r = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(HANDLE)}&key=${KEY}`,
    { next: { revalidate: 86400 } }
  );
  if (!r.ok) return null;
  const d = await r.json();
  return d.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

export async function getVideos(max = 5): Promise<Video[]> {
  if (!KEY) return [];
  try {
    const pl = await uploadsPlaylistId();
    if (!pl) return [];
    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${max}&playlistId=${pl}&key=${KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!r.ok) return [];
    const d = await r.json();
    return ((d.items as YTItem[]) || [])
      .map((it) => {
        const s = it.snippet;
        const t = s.thumbnails;
        return {
          id: s.resourceId?.videoId || "",
          title: s.title,
          date: s.publishedAt,
          thumb: (t.maxres || t.standard || t.high || t.medium || t.default)?.url || "",
        };
      })
      .filter((v) => v.id);
  } catch {
    return [];
  }
}
