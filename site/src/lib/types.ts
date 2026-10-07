// microCMS content model types — mirror of cms-design.md.
// Adjust field names here if the microCMS schema is tweaked.

import type { MicroCMSImage, MicroCMSListContent } from "microcms-js-sdk";

export type NewsCategory =
  | "Result" | "Game Report" | "Team" | "Event" | "Goods"
  | "Fanclub" | "Partner" | "Media" | "School" | "SDGs";

export type News = MicroCMSListContent & {
  title: string;
  publishedDate: string;
  categories: NewsCategory[];
  thumbnail?: MicroCMSImage;
  body: string;
};

// matches schema is the simplified/importable version: scores & note are
// free-text (textArea), status is text. (repeater/relation come later.)
export type Match = MicroCMSListContent & {
  league?: string;    // EXE PREMIER (without the title sponsor — this is what the filter groups by)
  leagueSponsor?: string; // 冠スポンサー, e.g. "PLCO" -> shown as "PLCO 3XS"
  leagueExtra?: string;   // その他 — e.g. an edition "11th"; shown on the league line, not part of the league
  titleOrder?: string;    // order of the league-line parts, e.g. "extra league year -season -sponsor" (see lib/match)
  round?: string;     // ROUND.6 (no year — the year is its own field)
  year?: number;      // league year shown next to the league, e.g. 2026 (falls back to the date if unset)
  season?: string;    // season override, e.g. "2025-26" (derived from the date if unset)
  showSeason?: boolean; // show "2025-26 SEASON" instead of the year next to the league
  hideYear?: boolean;   // show neither the year nor the season
  date?: string;
  dateLabel?: string; // 08/― 日程調整中
  roundName?: string; // 八戸ラウンド
  venue?: string;
  status?: string;    // 予定 / 結果 / 調整中
  resultBadge?: string;
  scores?: string;    // free text for now
  note?: string;
  memo?: string;      // 備考 / irregular info shown on the card
  entryPlayers?: Player[];   // relationList -> players (expanded via depth)
  eventUrl?: string;         // 大会公式サイト / event homepage
  fibaEventUrl?: string;     // FIBA 3x3 event page
  liveUrl?: string;          // live-stream link
  articleUrl?: News[];       // related news article(s) — relation to `news` (depth-expanded)
};

export type PlayerPosition = "Guard" | "Forward" | "Center";

export type Player = MicroCMSListContent & {
  number: number;
  nameJa: string;
  nameEn: string;
  position?: PlayerPosition | string;
  height?: string;
  hometown?: string;
  nationality?: string;
  birthdate?: string;
  bio?: string;
  active?: boolean;             // current roster? (false = former player, hidden from home)
  photo?: MicroCMSImage;        // roster card (3:4 headshot)
  photoDetail?: MicroCMSImage;  // modal portrait (different shot)
  snsInstagram?: string;        // full URL; icon hidden if empty
  snsX?: string;                // full URL; icon hidden if empty
  fibaUrl?: string;             // FIBA 3x3 player page URL; icon hidden if empty
  tags?: string[];
};

export type Partner = MicroCMSListContent & {
  name: string;
  logo?: MicroCMSImage;
  url?: string;
  tier?: string;
  order?: number;
};

export type TopBanner = MicroCMSListContent & {
  image?: MicroCMSImage;
  linkUrl?: string;
  title?: string;
  order?: number;
};

export type SiteSettings = {
  noteBarText?: string;
  snsInstagram?: string;
  snsX?: string;
  snsFacebook?: string;
  snsYoutube?: string;
  snsLine?: string;
  fanClubUrl?: string;
};
