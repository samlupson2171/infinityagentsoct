import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest, userId?: string): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
  } = config;

  return async function rateLimiter(
    request: NextRequest,
    userId?: string
  ): Promise<{ allowed: boolean; response?: NextResponse }> {
    const identifier = getClientIdentifier(request, userId);
    const key = `${request.nextUrl.pathname}:${identifier}`;
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
      return { allowed: true };
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return {
        allowed: false,
        response: NextResponse.json(
          {
            success: false,
            error: message,
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': entry.resetTime.toString(),
            },
          }
        ),
      };
    }

    // Update entry
    rateLimitStore.set(key, entry);

    return { allowed: true };
  };
}

/**
 * Pre-configured rate limiters for different endpoints
 */

// Standard rate limiter: 100 requests per 15 minutes
export const standardRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
});

// Strict rate limiter for file uploads: 10 requests per 15 minutes
export const uploadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many upload requests, please try again later',
});

// Import rate limiter: 5 requests per 15 minutes
export const importRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many import requests, please try again later',
});

// Calculation rate limiter: 50 requests per minute
export const calculationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 50,
  message: 'Too many calculation requests, please slow down',
});

/**
 * Get rate limit status for a client
 */
export function getRateLimitStatus(
  request: NextRequest,
  userId?: string,
  pathname?: string
): {
  limit: number;
  remaining: number;
  reset: number;
} | null {
  const identifier = getClientIdentifier(request, userId);
  const key = `${pathname || request.nextUrl.pathname}:${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return null;
  }

  return {
    limit: 100, // Default, should be configurable
    remaining: Math.max(0, 100 - entry.count),
    reset: entry.resetTime,
  };
}

/**
 * Clear rate limit for a specific client (useful for testing or admin override)
 */
export function clearRateLimit(
  request: NextRequest,
  userId?: string,
  pathname?: string
): void {
  const identifier = getClientIdentifier(request, userId);
  const key = `${pathname || request.nextUrl.pathname}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
