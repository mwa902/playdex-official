import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Tell Next.js this is a sub-folder in a monorepo so it doesn't
  // complain about multiple lockfiles (no __dirname needed)
  outputFileTracingRoot: process.cwd().replace(/[\\/]frontend$/, ''),
};

export default nextConfig;
