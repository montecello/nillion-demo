/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // Externalize libsodium and blindfold from server-side bundles
  serverExternalPackages: ['@nillion/blindfold', 'libsodium-wrappers-sumo'],
  webpack: (config, { isServer }) => {
    // Don't bundle blindfold and libsodium on server
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@nillion/blindfold': 'commonjs @nillion/blindfold',
        'libsodium-wrappers-sumo': 'commonjs libsodium-wrappers-sumo',
      });
    }
    
    return config;
  },
}

module.exports = nextConfig
