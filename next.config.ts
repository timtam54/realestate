import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    minimumCacheTTL: 60,
    unoptimized: true,
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
};

export default nextConfig;
