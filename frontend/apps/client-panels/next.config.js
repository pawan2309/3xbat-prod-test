/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Suppress build warnings for dynamic routes
  experimental: {
    serverComponentsExternalPackages: ['socket.io-client'],
  },
  // Skip static optimization for pages that use dynamic features
  trailingSlash: false,
  // Disable static generation to prevent styled-jsx context issues
  // output: 'standalone', // Only use for production builds
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://13.60.145.70:4000'}/api/:path*`,
      },
    ]
  },
        async headers() {
          return [
            {
              source: '/(.*)',
              headers: [
                {
                  key: 'Content-Security-Policy',
                  value: `
                    default-src 'self';
                    script-src 'self' 'unsafe-inline' 'unsafe-eval';
                    style-src 'self' 'unsafe-inline';
                    img-src 'self' data: blob:;
                    media-src 'self' ${process.env.NEXT_PUBLIC_STREAMING_DOMAIN || 'https://mis3.sqmr.xyz:3334'} blob:;
                    connect-src 'self' ${process.env.NEXT_PUBLIC_STREAMING_DOMAIN || 'https://mis3.sqmr.xyz:3334'} ws: wss: ${process.env.NEXT_PUBLIC_API_URL || 'http://13.60.145.70:4000'} ${process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://13.60.145.70:4000'};
                    frame-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://13.60.145.70:4000'};
                  `.replace(/\s{2,}/g, ' ').trim(),
                },
              ],
            },
          ]
        },
}

module.exports = nextConfig