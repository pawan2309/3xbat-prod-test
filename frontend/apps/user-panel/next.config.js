/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    PORT: "3000",
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000",
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:4000",
    NEXT_PUBLIC_EXTERNAL_API_BASE_URL: process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL || "http://localhost:8000",
    NEXT_PUBLIC_AWS_PROXY_URL: process.env.NEXT_PUBLIC_AWS_PROXY_URL || "http://localhost:8000",
    NEXT_PUBLIC_CRICKET_SCORE: process.env.NEXT_PUBLIC_CRICKET_SCORE || "http://localhost:8000/cricket/scorecard?marketId=",
    NEXT_PUBLIC_CRICKET_TV: process.env.NEXT_PUBLIC_CRICKET_TV || "http://localhost:8000/cricket/tv?eventId=",
    NEXT_PUBLIC_CRICKET_FIX: process.env.NEXT_PUBLIC_CRICKET_FIX || "http://localhost:8000/cricket/fixtures",
    NEXT_PUBLIC_CRICKET_ODDS: process.env.NEXT_PUBLIC_CRICKET_ODDS || "http://localhost:8000/cricket/odds?eventId=",
    NEXT_PUBLIC_CASINO_TV: process.env.NEXT_PUBLIC_CASINO_TV || "http://localhost:8000/casino/tv?streamid=",
    NEXT_PUBLIC_CASINO_DATA: process.env.NEXT_PUBLIC_CASINO_DATA || "http://localhost:8000/casino/data/{gameType}",
    NEXT_PUBLIC_CASINO_RES: process.env.NEXT_PUBLIC_CASINO_RES || "http://localhost:8000/casino/results/{gameType}",
  },
  // Disable Next.js automatic scroll restoration
  experimental: {
    scrollRestoration: false,
  },
  // Reduce reload frequency
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/prisma/migrations/**'],
      };
    }
    return config;
  },
};

module.exports = nextConfig; 