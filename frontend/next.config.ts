import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Allow images from any host (useful for avatar fallbacks)
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
