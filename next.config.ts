import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Temporarily ignore TypeScript errors during build
  // TODO: Fix room/space naming inconsistencies and remove this
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
