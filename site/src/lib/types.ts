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
  league?: string;    // EXE PREMIER
  round?: string;     // ROUND.6
  date?: string;
  dateLabel?: string; // 08/― 日程調整中
  roundName?: string; // 八戸ラウンド
  venue?: string;
  status?: string;    // 予定 / 結果 / 調整中
  resultBadge?: string;
  scores?: string;    // free text for now
  note?: string;
  entryPlayers?: Player[];   // relationList -> players (expanded via depth)
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
