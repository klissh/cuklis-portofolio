// Server Component. Semua logic client-side (Lenis, custom cursor, navbar,
// menu mobile) sekarang berada di ./ClientChrome.tsx. Pemisahan ini membuat
// layout.tsx bisa mengekspor `metadata` (title, description, Open Graph)
// yang dirender di server — sebelumnya seluruh layout dipaksa 'use client'
// sehingga Next.js tidak pernah mengirim metadata SEO yang proper.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { gilroy } from "@/fonts/fonts";
import ClientChrome from "./ClientChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muhammad Muhibuddin Mukhlish | Portfolio",
  description:
    "Portofolio Muhammad Muhibuddin Mukhlish — proyek, pengalaman, dan sertifikasi di bidang pengembangan software.",
  openGraph: {
    title: "Muhammad Muhibuddin Mukhlish | Portfolio",
    description:
      "Portofolio Muhammad Muhibuddin Mukhlish — proyek, pengalaman, dan sertifikasi di bidang pengembangan software.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${gilroy.variable} antialiased font-gilroy`}>
        <ClientChrome>{children}</ClientChrome>
      </body>
    </html>
  );
}
