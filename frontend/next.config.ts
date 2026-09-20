import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Silence the monorepo lockfile warning
  outputFileTracingRoot: path.join(__dirname, '../'),
};

export default nextConfig;
