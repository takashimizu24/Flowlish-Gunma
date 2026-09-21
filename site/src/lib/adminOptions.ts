// Dropdown / suggestion options shared by the admin forms.

export const NEWS_CATEGORIES = [
  "Result", "Game Report", "Team", "Event", "Goods",
  "Fanclub", "Partner", "Media", "School", "SDGs",
] as const;

export const MATCH_STATUS = ["予定", "結果"] as const;

// Final ranking suggestions (editable — free text with these as datalist hints).
export const RESULT_BADGES = [
  "優勝", "準優勝", "3位", "ベスト4", "5位", "6位", "7位", "8位", "予選敗退", "欠場",
];

// Player positions (datalist suggestions — free text, combos like "Guard / Forward" allowed).
export const PLAYER_POSITIONS = ["Guard", "Forward", "Center", "Guard / Forward", "Forward / Center"];

// Nationality suggestions (datalist).
export const NATIONALITIES = ["Japan", "USA", "Canada", "Australia", "UK"];

// Common game phases (datalist suggestions).
// QD-* = Qualifying Draw (予選の予選); shown as its own group above the 予選ラウンド.
export const GAME_PHASES = [
  "QD-A", "QD-B", "QD-C", "QD-D",
  "GROUP-A", "GROUP-B", "GROUP-C", "GROUP-D", "予選", "準決勝", "決勝", "3位決定戦",
];
