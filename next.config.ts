import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
};

export default nextConfig;
