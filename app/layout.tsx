import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "検定対策 | ITF+ / SEA/J",
  description: "Next.js + TypeScript + CSS Modules の学習用検定対策サイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
