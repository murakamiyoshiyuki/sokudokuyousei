import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sokudokuyousei.vercel.app";

export const metadata: Metadata = {
  title: "レッスン練習 スケジュール調整 | ビジネス脳トレ速読",
  description: "暗唱嘉人のビジネス脳トレ速読 - レッスン練習のスケジュール調整ツール。仮検定・本検定の日程を簡単に調整できます。",
  keywords: "速読, ビジネス脳トレ, レッスン, スケジュール調整, 暗唱嘉人",
  authors: [{ name: "暗唱嘉人" }],
  creator: "暗唱嘉人",
  publisher: "ビジネス脳トレ速読",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    title: "レッスン練習 スケジュール調整 | ビジネス脳トレ速読",
    description: "暗唱嘉人のビジネス脳トレ速読 - レッスン練習のスケジュール調整ツール。仮検定・本検定の日程を簡単に調整できます。",
    siteName: "ビジネス脳トレ速読",
    images: [
      {
        url: `${siteUrl}/ogp-image.jpg`,
        width: 1200,
        height: 630,
        alt: "ビジネス脳トレ速読 レッスン練習 スケジュール調整",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "レッスン練習 スケジュール調整 | ビジネス脳トレ速読",
    description: "暗唱嘉人のビジネス脳トレ速読 - レッスン練習のスケジュール調整ツール",
    images: [`${siteUrl}/ogp-image.jpg`],
    creator: "@anshoukajin",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
