'use client';

// Semua logic interaktif (Lenis smooth scroll, custom cursor, navbar, menu
// mobile) dipindahkan ke sini dari layout.tsx agar layout.tsx bisa menjadi
// Server Component dan mendukung `export const metadata` (title, description,
// Open Graph tags) untuk SEO — sebelumnya seluruh layout memakai 'use client'
// sehingga Next.js tidak bisa merender metadata dinamis di server sama sekali.

import React, { useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import GooeyNav from "@/blocks/Components/GooeyNav/GooeyNav";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Define items for GooeyNav
const items = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Certificates", href: "#certificates" },
];

// Define social media links and placeholder icon paths
const socialLinks = [
  { platform: "GitHub", href: "https://github.com/klissh", iconPath: "/icons/github_icon.svg" },
  { platform: "LinkedIn", href: "https://www.linkedin.com/in/muhammad-muhibuddin-mukhlish/", iconPath: "/icons/linkedin_icon.svg" },
  { platform: "Gmail", href: "mailto:muhammad.muhibuddin.mukhlish@gmail.com", iconPath: "/icons/gmail_icon.svg" },
];

export default function ClientChrome({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Get current pathname
  const pathname = usePathname();

  // Calculate active index based on pathname
  const activeIndex = items.findIndex(item => item.href === pathname);

  // --- Lenis Smooth Scrolling Implementation ---
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Browser (terutama saat reload/kembali dari halaman lain) secara
      // default mencoba memulihkan posisi scroll terakhir sebelum halaman
      // di-refresh (history.scrollRestoration bawaan = 'auto'). Ini yang
      // membuat halaman terlihat "start" agak ke bawah (dekat section
      // About/Tech Stack) alih-alih benar-benar di paling atas saat baru
      // dibuka -- terutama kentara di mobile karena viewport lebih pendek.
      // Matikan restorasi otomatis itu, lalu pastikan mulai dari paling atas
      // -- KECUALI memang ada hash (mis. "#projects") di URL yang sengaja
      // dituju sebagai deep link ke section tertentu, supaya itu tetap jalan.
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      if (!window.location.hash) {
        window.scrollTo(0, 0);
      }

      lenis.current = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis.current?.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.current?.destroy();
      };
    }
  }, []);
  // --- End Lenis Implementation ---

  // --- Custom Cursor Implementation ---
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const dotSpringConfig = { damping: 25, stiffness: 200 };
  const outlineSpringConfig = { damping: 35, stiffness: 400 };

  const dotX = useSpring(cursorX, dotSpringConfig);
  const dotY = useSpring(cursorY, dotSpringConfig);

  const outlineX = useSpring(dotX, outlineSpringConfig);
  const outlineY = useSpring(dotY, outlineSpringConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    setTimeout(() => {
      cursorX.set(window.innerWidth / 2);
      cursorY.set(window.innerHeight / 2);
    }, 0);

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);
  // --- End Custom Cursor Implementation ---

  // Jika halaman admin, return layout minimal (tanpa navbar, cursor, dsb)
  if (pathname?.startsWith("/admin")) {
    return <div className="bg-gray-100 min-h-screen">{children}</div>;
  }

  return (
    <div className="bg-black min-h-screen" style={{ cursor: 'none' }}>
      {/* Custom Cursor Dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          pointerEvents: 'none',
          left: 0,
          top: 0,
          position: 'fixed',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#06b6d4',
          boxShadow: '0 0 10px 4px rgba(6, 182, 212, 0.7)',
        }}
        className="hidden md:block"
      />
      {/* Custom Cursor Outline */}
      <motion.div
        style={{
          x: outlineX,
          y: outlineY,
          pointerEvents: 'none',
          left: 0,
          top: 0,
          position: 'fixed',
          zIndex: 9998,
          transform: 'translate(-50%, -50%)',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: '2px solid #0891b2',
          opacity: 0.5,
        }}
        className="hidden md:block"
      />
      {/* Header Section */}
      <header className="sticky top-0 z-50 flex w-full items-center justify-between px-4 py-0 md:px-8 md:py-0 bg-transparent backdrop-blur-[3px] pt-4 md:pt-6 mb-0">
        <Link href="/" passHref>
          <Image
            src="/logo/cuklis-logo-putih.png"
            alt="Lauv Logo"
            width={70}
            height={70}
            className="m-1 md:m-1 transition-all duration-300 hover:scale-150 hover:rotate-10 hover:brightness-125"
          />
        </Link>

        <div className="hidden md:block font-medium" style={{ height: '70px', width: '500px', position: 'relative' }}>
          <GooeyNav
            items={items}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={activeIndex !== -1 ? activeIndex : 0}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>

        <button
          className="md:hidden text-white p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <div className="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ease-in-out"></div>
          <div className="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ease-in-out"></div>
          <div className="w-6 h-0.5 bg-white transition-all duration-300 ease-in-out"></div>
        </button>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-transparent backdrop-blur-[10px] pt-10 fixed top-[72px] sm:top-[80px] md:top-[96px] right-0 left-0 z-40 p-4 sm:p-5 overflow-y-auto h-[calc(100vh_-_72px)] sm:h-[calc(100vh_-_80px)] md:h-[calc(100vh_-_96px)]">
          <nav className="flex flex-col space-y-4">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-white hover:text-gray-300 py-2 px-4 font-medium text-base sm:text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
      {/* End Header Section */}

      {children}

      {/* Sticky Social Media Container */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 bg-black/60 border border-white/[.30] border-dashed rounded-full p-2 md:p-4 flex flex-col items-center space-y-7 md:space-y-5">
        {socialLinks.map((link) => (
          <Link
            key={link.platform}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform duration-200 hover:scale-110"
          >
            <Image
              src={link.iconPath}
              alt={`${link.platform} icon`}
              width={20}
              height={20}
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain"
            />
          </Link>
        ))}
      </div>
      {/* End Sticky Social Media Container */}
    </div>
  );
}
