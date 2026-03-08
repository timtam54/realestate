import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge-compatible rate limiting using in-memory Map
 * Note: This works per-instance. For multi-instance deployments, use Redis/Upstash
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configurations per route pattern
const ROUTE_LIMITS: Record<string, { limit: number; window: number }> = {
  '/api/auth': { limit: 10, window: 60 * 1000 }, // 10 requests per minute
  '/api/chat': { limit: 60, window: 60 * 1000 }, // 60 requests per minute
  '/api/push': { limit: 30, window: 60 * 1000 }, // 30 requests per minute
  '/api/comparables': { limit: 10, window: 60 * 1000 }, // 10 requests per minute (scraping)
  '/api/data-deletion': { limit: 5, window: 60 * 1000 }, // 5 requests per minute
  '/api': { limit: 100, window: 60 * 1000 }, // Default: 100 requests per minute
};

function getRouteLimit(pathname: string): { limit: number; window: number } {
  // Find the most specific matching route
  const sortedRoutes = Object.keys(ROUTE_LIMITS).sort((a, b) => b.length - a.length);
  for (const route of sortedRoutes) {
    if (pathname.startsWith(route)) {
      return ROUTE_LIMITS[route];
    }
  }
  return ROUTE_LIMITS['/api'];
}

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return request.ip || 'unknown';
}

function checkRateLimit(identifier: string, limit: number, window: number): {
  allowed: boolean;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up expired entries occasionally
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + window });
    return { allowed: true, remaining: limit - 1, reset: now + window };
  }

  entry.count++;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, reset: entry.resetTime };
  }

  return { allowed: true, remaining: limit - entry.count, reset: entry.resetTime };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Skip rate limiting for CSRF token endpoint (needed for other requests)
  if (pathname === '/api/auth/csrf') {
    return NextResponse.next();
  }

  const clientIP = getClientIP(request);
  const routeConfig = getRouteLimit(pathname);

  // Create a unique key combining IP and route prefix for granular limiting
  const routePrefix = pathname.split('/').slice(0, 3).join('/');
  const rateLimitKey = `${clientIP}:${routePrefix}`;

  const result = checkRateLimit(rateLimitKey, routeConfig.limit, routeConfig.window);

  if (!result.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': routeConfig.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', routeConfig.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
