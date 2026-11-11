import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
    // Avatar + CV uploads go through a Server Action (default limit: 1 MB).
    // Must stay below Vercel's 4.5 MB request cap.
    serverActions: { bodySizeLimit: '4mb' },
  },
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost",    port: "1337" },
      { protocol: "http",  hostname: "127.0.0.1",   port: "1337" },
      { protocol: "https", hostname: "*.strapiapp.com" },
      { protocol: "https", hostname: "*.media.strapiapp.com" },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
