import type { Metadata } from "next";
import { Barlow_Condensed, Noto_Color_Emoji } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

// Flag emoji fallback for devices without their own colour flags (Windows shows
// "JP"-style letters otherwise). Apple devices keep their own emoji — see .flag-emoji.
// Served in unicode-range slices, so only the flag glyphs are fetched, and only when needed.
const emoji = Noto_Color_Emoji({
  subsets: ["emoji"],
  weight: "400",
  variable: "--font-emoji",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "FLOWLISH GUNMA",
  description:
    "群馬・高崎を拠点に活動する女子3x3バスケットボールチーム FLOWLISH GUNMA 公式サイト。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${barlow.variable} ${emoji.variable}`}>
      <body>{children}</body>
    </html>
  );
}
