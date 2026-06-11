import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
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
