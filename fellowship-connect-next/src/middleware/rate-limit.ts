import { NextRequest, NextResponse } from 'next/server';
import { authRateLimiter, signupRateLimiter, apiReadRateLimiter, apiWriteRateLimiter, mediaUploadRateLimiter, notificationRateLimiter } from '@/lib/rate-limiter';

/**
 * Rate limiting middleware for Next.js API routes
 */

interface RateLimitOptions {
  limiter: (key: string) => Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }>;
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * Get client IP from request
 * @param request NextRequest
 * @returns Client IP address
 */
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

/**
 * Create rate limiting middleware
 * @param options Rate limiting options
 * @returns Middleware function
 */
export function createRateLimitMiddleware(options: RateLimitOptions) {
  return async function rateLimitMiddleware(request: NextRequest) {
    try {
      // Generate key for rate limiting
      const key = options.keyGenerator 
        ? options.keyGenerator(request)
        : `${getClientIP(request)}:${request.url}`;

      // Apply rate limiting
      const result = await options.limiter(key);

      // Add rate limit headers
      const headers = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toUTCString(),
      };

      // If rate limit exceeded, return error response
      if (!result.success) {
        return {
          response: NextResponse.json(
            {
              success: false,
              error: 'Rate limit exceeded',
              message: 'Too many requests, please try again later'
            },
            {
              status: 429,
              headers
            }
          ),
          headers: null
        };
      }

      // Return headers to be added to the response
      return { headers, response: null };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If rate limiting fails, allow the request to proceed
      return { headers: {}, response: null };
    }
  };
}

/**
 * Rate limiting middleware for authentication endpoints
 */
export const withAuthRateLimit = createRateLimitMiddleware({
  limiter: authRateLimiter,
  keyGenerator: (request) => `${getClientIP(request)}:${request.url}`
});

/**
 * Rate limiting middleware for signup endpoints
 */
export const withSignupRateLimit = createRateLimitMiddleware({
  limiter: signupRateLimiter,
  keyGenerator: (request) => `${getClientIP(request)}:${request.url}`
});

/**
 * Rate limiting middleware for API read endpoints
 */
export const withApiReadRateLimit = createRateLimitMiddleware({
  limiter: apiReadRateLimiter,
  keyGenerator: (request) => `${getClientIP(request)}:${request.url}`
});

/**
 * Rate limiting middleware for API write endpoints
 */
export const withApiWriteRateLimit = createRateLimitMiddleware({
  limiter: apiWriteRateLimiter,
  keyGenerator: (request) => `${getClientIP(request)}:${request.url}`
});

/**
 * Rate limiting middleware for media upload endpoints
 */
export const withMediaUploadRateLimit = createRateLimitMiddleware({
  limiter: mediaUploadRateLimiter,
  keyGenerator: (request) => `${getClientIP(request)}:${request.url}`
});

/**
 * Rate limiting middleware for notification endpoints
 */
export const withNotificationRateLimit = createRateLimitMiddleware({
  limiter: notificationRateLimiter,
  keyGenerator: (request) => `${getClientIP(request)}:${request.url}`
});