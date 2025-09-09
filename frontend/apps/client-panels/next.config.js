/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
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
                    connect-src 'self' https://mis3.sqmr.xyz:3334 ws: wss: http://localhost:4000;
                    frame-src 'self' http://localhost:4000;
                  `.replace(/\s{2,}/g, ' ').trim(),
                },
              ],
            },
          ]
        },
}

module.exports = nextConfig