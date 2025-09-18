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
    PORT: "3002",
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://13.60.145.70:4000",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://13.60.145.70:4000",
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://13.60.145.70:4000",
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || "ws://13.60.145.70:4000",
    NEXT_PUBLIC_EXTERNAL_API_BASE_URL: process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL || "https://marketsarket.qnsports.live",
    NEXT_PUBLIC_AWS_PROXY_URL: process.env.NEXT_PUBLIC_AWS_PROXY_URL || "https://marketsarket.qnsports.live",
    NEXT_PUBLIC_CRICKET_SCORE: process.env.NEXT_PUBLIC_CRICKET_SCORE || "https://marketsarket.qnsports.live/cricket/scorecard?marketId=",
    NEXT_PUBLIC_CRICKET_TV: process.env.NEXT_PUBLIC_CRICKET_TV || "https://marketsarket.qnsports.live/cricket/tv?eventId=",
    NEXT_PUBLIC_CRICKET_FIX: process.env.NEXT_PUBLIC_CRICKET_FIX || "https://marketsarket.qnsports.live/cricket/fixtures",
    NEXT_PUBLIC_CRICKET_ODDS: process.env.NEXT_PUBLIC_CRICKET_ODDS || "https://marketsarket.qnsports.live/cricket/odds?eventId=",
    NEXT_PUBLIC_CASINO_TV: process.env.NEXT_PUBLIC_CASINO_TV || "https://casino-api.example.com/casino/tv?streamid=",
    NEXT_PUBLIC_CASINO_DATA: process.env.NEXT_PUBLIC_CASINO_DATA || "https://casino-api.example.com/casino/data/{gameType}",
    NEXT_PUBLIC_CASINO_RES: process.env.NEXT_PUBLIC_CASINO_RES || "https://casino-api.example.com/casino/results/{gameType}",
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