/**
 * Static site settings (kept in code, not in microCMS, to stay within the
 * free 5-API limit). These rarely change; update here and redeploy when needed.
 */
export const siteConfig = {
  sns: {
    instagram: "https://www.instagram.com/flowlish3x3/",
    x: "https://x.com/flowlish3x3",
    facebook: "https://www.facebook.com/FLOWLISH-GUNMAEXE-100092041747025/",
    youtube: "https://www.youtube.com/@flowlish3x3",
    line: "https://lin.ee/YORCJaa",
  },
  // YouTube channel for the home VIDEO section (the public feed needs the UC… id, not the @handle)
  youtubeChannelId: "UCs77Oh4IkE3flrtPvt0vVQw",
  // leagues listed in the header's SCHEDULE drop-down (exact league names, in this order)
  menuLeagues: ["3x3.EXE PREMIER", "3XS", "FIBA 3x3 Women's Series"],
  fanClubUrl: "/fanclub", // COMING SOON page until the real fan club launches
  schoolUrl: "/school",   // COMING SOON page until the school opens
  shopUrl: "https://flowlish3x3.base.shop/", // external online shop (opens in a new tab)
  // Orange top bar. Empty string hides it (the mock's "デザイン案" label is
  // dropped for production).
  noteBarText: "",
} as const;
