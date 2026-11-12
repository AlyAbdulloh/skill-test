import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pino'],
}

export default nextConfig
