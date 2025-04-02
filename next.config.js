/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    appDir: true,
  },
  // Expose environment variables to the browser
  env: {
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
  },
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    // Add support for PDF.js worker
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Handle Node.js specific modules for browser environment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      util: false,
      crypto: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
