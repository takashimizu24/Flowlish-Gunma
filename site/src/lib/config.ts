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
  fanClubUrl: "#", // TODO: real FAN CLUB URL when available
  // Orange top bar. Empty string hides it (the mock's "デザイン案" label is
  // dropped for production).
  noteBarText: "",
} as const;
