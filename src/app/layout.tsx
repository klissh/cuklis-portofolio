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
  icons: {
    // Browser modern membaca media query ini dan otomatis memilih varian
    // yang kontras dengan tema tab-nya: logo hitam saat tab terang, logo
    // putih saat tab gelap. Urutan (light lebih dulu) juga jadi fallback
    // teraman untuk browser lama yang mengabaikan atribut media.
    icon: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)", type: "image/png" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)", type: "image/png" },
    ],
    // /favicon.ico (di folder public/, bukan file konvensi khusus app/)
    // tetap ada sebagai fallback untuk tool/bot lama yang langsung meminta
    // /favicon.ico tanpa membaca tag <link> di HTML sama sekali.
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
