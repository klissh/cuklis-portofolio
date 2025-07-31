import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'vfrcihtxindrhqcuolgl.supabase.co',
      'upload.wikimedia.org',
      'cdn.jsdelivr.net',
      'raw.githubusercontent.com',
      'logos-world.net',
      'seeklogo.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
