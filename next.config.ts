import type { NextConfig } from "next";
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

// Base security headers (always applied)
const baseSecurityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  },
];

// Production-only headers (HSTS, strict CSP)
const productionHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.azurewebsites.net https://*.googleapis.com https://*.blob.core.windows.net https://api.ipify.org wss://*",
      "frame-src 'self' https://accounts.google.com https://login.microsoftonline.com https://www.facebook.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
];

// Combine headers based on environment
const securityHeaders = isDev
  ? baseSecurityHeaders
  : [...baseSecurityHeaders, ...productionHeaders];

const nextConfig: NextConfig = {
  // For Azure App Service deployment
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false, // Disabled: causes duplicate OAuth callbacks in dev mode

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

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
