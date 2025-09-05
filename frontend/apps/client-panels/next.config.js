const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true, // Allow imports outside app directory
  },
  // Optimize for faster development
  typescript: {
    // Skip type checking during development for faster builds
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Skip ESLint during development for faster builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  // Note: fastRefresh is enabled by default in Next.js 14
  images: {
    domains: ['localhost', 'api.3xbat.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000',
    NEXT_PUBLIC_FRONTEND_PORT: '3001', // Client Panels Port
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  webpack(config) {
    // Remove shared-assets specific configuration
    return config;
  },
}

module.exports = nextConfig 