import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
    // Avatar + CV uploads go through a Server Action (default limit: 1 MB).
    // Must stay below Vercel's 4.5 MB request cap.
    serverActions: { bodySizeLimit: '4mb' },
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
