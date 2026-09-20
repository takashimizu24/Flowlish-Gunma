import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
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
    <html lang="ja" className={barlow.variable}>
      <body>{children}</body>
    </html>
  );
}
