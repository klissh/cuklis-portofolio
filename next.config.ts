import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'vfrcihtxindrhqcuolgl.supabase.co',
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
