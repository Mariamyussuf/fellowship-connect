import { Redis } from '@upstash/redis';

/**
 * Rate Limiter using Upstash Redis
 */

// Initialize Redis client if environment variables are available
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Rate limiter configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number;      // Maximum requests allowed in the window
  keyPrefix?: string; // Prefix for Redis keys
}

/**
 * Rate limiter result
 */
interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Create a rate limiter
 * @param config Rate limiter configuration
 * @returns Rate limiter function
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimit(key: string): Promise<RateLimitResult> {
    // If Redis is not configured, allow all requests
    if (!redis) {
      console.warn('Redis not configured, rate limiting disabled');
      return {
        success: true,
        limit: config.max,
        remaining: config.max,
        resetTime: Date.now() + config.windowMs
      };
    }

    try {
      const prefixedKey = `${config.keyPrefix || 'rate-limit'}:${key}`;
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Remove old entries
      await redis.zremrangebyscore(prefixedKey, 0, windowStart);

      // Get current count
      const currentCount = await redis.zcard(prefixedKey);

      // Check if limit is exceeded
      if (currentCount >= config.max) {
        const resetTime = await redis.zrange(prefixedKey, 0, 0, { withScores: true });
        return {
          success: false,
          limit: config.max,
          remaining: 0,
          resetTime: resetTime.length > 1 ? parseInt(resetTime[1] as string) + config.windowMs : now + config.windowMs
        };
      }

      // Add current request
      await redis.zadd(prefixedKey, { score: now, member: now.toString() });
      await redis.expire(prefixedKey, Math.ceil(config.windowMs / 1000));

      return {
        success: true,
        limit: config.max,
        remaining: config.max - currentCount - 1,
        resetTime: now + config.windowMs
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // If Redis fails, allow the request to proceed
      return {
        success: true,
        limit: config.max,
        remaining: config.max,
        resetTime: Date.now() + config.windowMs
      };
    }
  };
}

/**
 * Predefined rate limiters
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 requests
  keyPrefix: 'auth'
});

export const signupRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,                   // 3 requests
  keyPrefix: 'signup'
});

export const apiReadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,            // 100 requests
  keyPrefix: 'api-read'
});

export const apiWriteRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50,             // 50 requests
  keyPrefix: 'api-write'
});

export const mediaUploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                  // 10 requests
  keyPrefix: 'media-upload'
});

export const notificationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,                  // 50 requests
  keyPrefix: 'notification'
});