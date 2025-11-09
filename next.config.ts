import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Azure Static Web Apps, don't use 'standalone' or 'export'
  // Leave output unset for hybrid rendering (static + API routes)
  // output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false, // Disabled: causes duplicate OAuth callbacks in dev mode
  images: {
    unoptimized: true,
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
