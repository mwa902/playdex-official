import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },

  // Monorepo: trace files from the repo root, not just frontend/
  outputFileTracingRoot: process.cwd().replace(/[\\/]frontend$/, ''),

  // ── API proxy rewrites ──────────────────────────────────────────────────
  // All /api/* calls from the browser are rewritten to the backend.
  // Locally  → http://localhost:5000
  // On Vercel → NEXT_PUBLIC_API_BASE_URL (set in Vercel env vars)
  //
  // This means the browser always calls the *same* origin (no CORS needed
  // for deployed frontend), and the backend URL never leaks to the client.
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      'http://localhost:5000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
