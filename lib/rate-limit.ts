/**
 * In-memory rate limiter for API routes
 * For production with multiple instances, consider using Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result with remaining requests and reset time
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;

  const existing = rateLimitStore.get(key);

  // If no existing entry or window has expired, create new entry
  if (!existing || now > existing.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      success: true,
      remaining: config.limit - 1,
      reset: newEntry.resetTime,
      limit: config.limit,
    };
  }

  // Increment count
  existing.count++;

  // Check if over limit
  if (existing.count > config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: existing.resetTime,
      limit: config.limit,
    };
  }

  return {
    success: true,
    remaining: config.limit - existing.count,
    reset: existing.resetTime,
    limit: config.limit,
  };
}

/**
 * Get client IP from request headers
 * Handles various proxy configurations
 */
export function getClientIP(request: Request): string {
  // Check various headers for forwarded IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default identifier
  return 'unknown';
}

// Preset configurations for different use cases
export const RATE_LIMITS = {
  /** Standard API endpoint: 100 requests per minute */
  standard: { limit: 100, windowSeconds: 60 },
  /** Strict limit for sensitive operations: 10 requests per minute */
  strict: { limit: 10, windowSeconds: 60 },
  /** Auth endpoints: 5 requests per minute */
  auth: { limit: 5, windowSeconds: 60 },
  /** Message sending: 30 messages per minute */
  messaging: { limit: 30, windowSeconds: 60 },
  /** Push notifications: 20 per minute */
  notifications: { limit: 20, windowSeconds: 60 },
  /** Web scraping: 5 requests per minute */
  scraping: { limit: 5, windowSeconds: 60 },
} as const;
