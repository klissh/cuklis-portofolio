import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // SEBELUMNYA remotePatterns memakai hostname: '**' yang mengizinkan
    // Next.js Image Optimizer memproses gambar dari domain manapun di
    // internet. Ini berisiko disalahgunakan sebagai proxy gambar terbuka
    // (siapa saja bisa memaksa server men-download & memproses file dari
    // URL apapun lewat endpoint /_next/image). Sekarang dibatasi hanya ke
    // domain yang benar-benar dipakai proyek ini.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vfrcihtxindrhqcuolgl.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net',
      },
      {
        protocol: 'https',
        hostname: 'seeklogo.com',
      },
    ],
  },
  eslint: {
    // NOTE: tetap di-set true untuk sekarang agar build tidak tiba-tiba
    // gagal karena error lint yang sudah lama ada. Rekomendasi: jalankan
    // `npm run lint` secara terpisah, bereskan errornya, lalu ubah ini
    // ke false supaya lint benar-benar menjaga kualitas kode di setiap build.
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
