/**
 * In-memory rate limiter for brute-force protection.
 * Tracks attempts per identifier (IP address) within a sliding window.
 *
 * Production note: For horizontal scaling (multiple Vercel instances),
 * replace with Upstash Redis rate limiting. This implementation works
 * for single-instance deployments.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Window in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Check rate limit for a given identifier (usually IP address).
 *
 * @param identifier - Unique key (e.g., IP address)
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No existing entry or window expired — allow and start fresh
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxAttempts - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
    };
  }

  // Within window — check if under limit
  if (entry.count < config.maxAttempts) {
    entry.count++;
    return {
      success: true,
      remaining: config.maxAttempts - entry.count,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Rate limited
  return {
    success: false,
    remaining: 0,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

// Preset configurations
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 10 * 60 * 1000, // 5 attempts per 10 minutes
};

export const FORGOT_PASSWORD_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 3 attempts per 15 minutes
};
