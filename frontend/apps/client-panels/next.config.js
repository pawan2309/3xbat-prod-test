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
        destination: 'http://localhost:4000/api/:path*',
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
                    media-src 'self' https://mis3.sqmr.xyz:3334 blob:;
                    connect-src 'self' https://mis3.sqmr.xyz:3334 ws: wss: http://localhost:4000 http://localhost:5000;
                    frame-src 'self' http://localhost:4000;
                  `.replace(/\s{2,}/g, ' ').trim(),
                },
              ],
            },
          ]
        },
}

module.exports = nextConfig