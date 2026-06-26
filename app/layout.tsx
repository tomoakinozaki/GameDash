import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GameDash - ゲーム価格比較サイト | Steam、Epic、GOGの価格を一か所で",
    template: "%s | GameDash",
  },
  description: "Steam、Epic Games Store、GOG、itch.io、Indiegalaのゲーム価格を比較。無料ゲームや割引情報をリアルタイムで確認。日本円表示対応。",
  keywords: "ゲーム, 価格比較, Steam, Epic Games, GOG, itch.io, Indiegala, 無料ゲーム, セール, GameDash, PCゲーム",
  authors: [{ name: "GameDash" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://gamedash.vercel.app",
    siteName: "GameDash",
    title: "GameDash - ゲーム価格比較サイト",
    description: "Steam、Epic Games Store、GOG、itch.io、Indiegalaのゲーム価格を比較。無料ゲームや割引情報をリアルタイムで確認。",
    images: [
      {
        url: "https://gamedash.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "GameDash - ゲーム価格比較サイト",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GameDash - ゲーム価格比較サイト",
    description: "Steam、Epic Games Store、GOG、itch.io、Indiegalaのゲーム価格を比較。",
    images: ["https://gamedash.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "AYJSkqWN9RRYRF9MJbDyAqauX9CdOK1FDPhcCdf4yBk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9772336492422057"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="bg-indigo-600 text-white py-4 shadow-md">
          <div className="max-w-5xl mx-auto px-8 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold hover:text-indigo-200 transition-colors">
              GameDash
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className="hover:text-indigo-200 transition-colors">
                ホーム
              </Link>
              <Link href="/about" className="hover:text-indigo-200 transition-colors">
                運営者情報
              </Link>
              <Link href="/privacy-policy" className="hover:text-indigo-200 transition-colors">
                プライバシー
              </Link>
              <Link href="/terms" className="hover:text-indigo-200 transition-colors">
                利用規約
              </Link>
              <Link href="/contact" className="hover:text-indigo-200 transition-colors">
                お問い合わせ
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="bg-gray-800 text-gray-400 py-8 mt-auto">
          <div className="max-w-5xl mx-auto px-8">
            <div className="flex flex-wrap gap-8 justify-center mb-4">
              <Link href="/about" className="hover:text-white transition-colors">
                運営者情報
              </Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                利用規約
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                お問い合わせ
              </Link>
            </div>
            <p className="text-center text-sm">
              © 2025 GameDash. All rights reserved.
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
