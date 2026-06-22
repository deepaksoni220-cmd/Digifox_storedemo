/**
 * In-memory rate limiter for Next.js API routes.
 * Tracks request counts per IP within a sliding time window.
 * 
 * NOTE: This is an in-memory store — it resets on server restart and
 * does not share state across multiple server instances. For a small
 * project this is perfectly adequate.
 */

class RateLimiter {
  /**
   * @param {Object} options
   * @param {number} options.maxRequests — max allowed requests per window
   * @param {number} options.windowMs   — time window in milliseconds
   */
  constructor({ maxRequests, windowMs }) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    /** @type {Map<string, { count: number, resetAt: number }>} */
    this.store = new Map();

    // Auto-cleanup expired entries every 60 seconds
    this._cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store) {
        if (now >= entry.resetAt) {
          this.store.delete(key);
        }
      }
    }, 60_000);

    // Prevent the interval from keeping the process alive
    if (this._cleanupInterval.unref) {
      this._cleanupInterval.unref();
    }
  }

  /**
   * Check whether a request from the given IP is allowed.
   * @param {string} ip
   * @returns {{ allowed: boolean, remaining: number, resetAt: number, retryAfterSeconds: number }}
   */
  check(ip) {
    const now = Date.now();
    let entry = this.store.get(ip);

    // First request or window expired — reset
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.store.set(ip, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, this.maxRequests - entry.count);
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);

    return {
      allowed: entry.count <= this.maxRequests,
      remaining,
      resetAt: entry.resetAt,
      retryAfterSeconds,
    };
  }
}

/**
 * Extract client IP from a Next.js request.
 * Falls back to "unknown" if no IP can be determined.
 */
export function getClientIp(request) {
  // x-forwarded-for is standard for proxied requests (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // x-real-ip is used by some proxies
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/**
 * Helper: Apply rate limit check to a request and return a 429 response if exceeded.
 * @param {RateLimiter} limiter
 * @param {Request} request
 * @param {string} [label]  — human-readable name for error messages
 * @returns {{ allowed: boolean, response?: Response, headers: Record<string, string> }}
 */
export function applyRateLimit(limiter, request, label = "requests") {
  const ip = getClientIp(request);
  const result = limiter.check(ip);

  const headers = {
    "X-RateLimit-Limit": String(limiter.maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetAt),
  };

  if (!result.allowed) {
    const body = JSON.stringify({
      error: `Too many ${label}. Maximum ${limiter.maxRequests} per day. Try again later.`,
      retryAfterSeconds: result.retryAfterSeconds,
    });

    return {
      allowed: false,
      headers,
      response: new Response(body, {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(result.retryAfterSeconds),
          ...headers,
        },
      }),
    };
  }

  return { allowed: true, headers };
}

// ─── Pre-configured limiters ───────────────────────────────────────────────

const ONE_DAY = 24 * 60 * 60 * 1000;

/** Max 5 login attempts per IP per 24 hours */
export const loginLimiter = new RateLimiter({ maxRequests: 5, windowMs: ONE_DAY });

/** Max 5 orders per IP per 24 hours */
export const orderLimiter = new RateLimiter({ maxRequests: 5, windowMs: ONE_DAY });
