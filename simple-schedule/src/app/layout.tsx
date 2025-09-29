import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "レッスン練習 スケジュール調整",
  description: "シンプルで簡単な日程調整ツール",
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
