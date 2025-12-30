interface RateLimitEntry {
  count: number;
  resetAt: number;
  blocked: boolean;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000;

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now && !entry.blocked) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
      blocked: false
    });
    return { allowed: true };
  }

  if (entry.blocked) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(identifier);
      return { allowed: true };
    }
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    };
  }

  if (entry.resetAt < now) {
    entry.count = 1;
    entry.resetAt = now + RATE_LIMIT_WINDOW;
    entry.blocked = false;
    return { allowed: true };
  }

  entry.count++;

  if (entry.count > MAX_ATTEMPTS) {
    entry.blocked = true;
    entry.resetAt = now + LOCKOUT_DURATION;
    console.warn(`Rate limit exceeded for identifier: ${identifier}`);
    return {
      allowed: false,
      retryAfter: Math.ceil(LOCKOUT_DURATION / 1000)
    };
  }

  return { allowed: true };
}

export function recordFailedAttempt(identifier: string): void {
  checkRateLimit(identifier);
}

export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}
