import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,  serverExternalPackages: ['@nillion/secretvaults', '@nillion/nuc'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      worker_threads: false,
    };
    return config;
  },  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
}

export default nextConfig
