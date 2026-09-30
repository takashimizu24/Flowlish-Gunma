import type { Video } from "./youtube";

/**
 * Last-resort list for the home VIDEO section, used only when the YouTube feed has never
 * been fetched successfully on this deployment (the feed has had outages returning
 * 404/500). Once a fetch succeeds, the cached live list is used instead — including while
 * later fetches fail. Refresh this snapshot occasionally (newest first, no Shorts).
 * Snapshot: 2026-09-30.
 */
export const VIDEO_FALLBACK: Video[] = [
  { id: "3h4LxN5tSiU", published: "2026-09-17T00:00:28Z", title: "【INSIDE FLOWLISH vol.12】FIBA 3x3 Women's Series Tokyo 2026@代々木第二体育館（東京都)" },
  { id: "uLWfahWLDgg", published: "2026-07-05T03:00:37Z", title: "【特別企画】髙橋芙由子×横井美沙 スペシャル対談#2" },
  { id: "rHSOWEAE_-U", published: "2026-06-28T03:00:25Z", title: "【特別企画】髙橋芙由子×横井美沙 スペシャル対談#1" },
  { id: "SI8YJm6JcME", published: "2026-04-07T07:36:19Z", title: "【INSIDE FLOWLISH vol.11】3XS 2025-26 WOMAN DIVISION FINAL@livedoor URBAN SPORTS PARK（東京都江東区)" },
  { id: "7uTJywDB2bQ", published: "2026-03-25T01:30:42Z", title: "【INSIDE FLOWLISH vol.10】第11回 3x3日本選手権 FINAL@横浜BUNTAI(神奈川県横浜市) l悲願の初制覇へ！ビッグタイトルに臨むチームの裏側に密着" },
].map((v) => ({ ...v, url: `https://www.youtube.com/watch?v=${v.id}` }));
