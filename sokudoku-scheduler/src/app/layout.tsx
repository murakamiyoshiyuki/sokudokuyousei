import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "速読インストラクター養成生 調整サイト",
  description: "養成生同士のレッスン練習の日程調整をワンクリックで完結",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">速読インストラクター養成生 調整サイト</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
