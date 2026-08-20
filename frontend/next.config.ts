import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/gh/yuhonas/free-exercise-db@main/exercises/**',
      },
    ],
  },
};

export default nextConfig;
