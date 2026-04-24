/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Disable ISR for pages that use context - they must be dynamic
  staticPageGenerationTimeout: 120,
  // Allow external images
  images: {
    unoptimized: true, // Disable Next.js image optimization to bypass external fetch issues
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
    ],
  },
};

module.exports = nextConfig;
