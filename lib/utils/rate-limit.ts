import { Logger } from '@/lib/utils/logger';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private defaultWindowMs: number;
  private defaultMax: number;

  constructor() {
    this.defaultWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
    this.defaultMax = parseInt(process.env.RATE_LIMIT_MAX || '10', 10);
  }

  private cleanupExpired(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  async checkLimit(
    identifier: string,
    options: { windowMs?: number; max?: number } = {}
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    this.cleanupExpired();

    const windowMs = options.windowMs || this.defaultWindowMs;
    const max = options.max || this.defaultMax;
    const now = Date.now();
    const resetTime = now + windowMs;

    if (!this.store[identifier]) {
      this.store[identifier] = {
        count: 1,
        resetTime
      };

      Logger.debug('Rate limit: First request', { 
        identifier: identifier.substring(0, 10) + '...', 
        remaining: max - 1 
      }, { location: 'rate-limit.checkLimit' });

      return {
        allowed: true,
        remaining: max - 1,
        resetTime
      };
    }

    const record = this.store[identifier];

    if (record.resetTime <= now) {
      record.count = 1;
      record.resetTime = resetTime;

      Logger.debug('Rate limit: Window reset', { 
        identifier: identifier.substring(0, 10) + '...', 
        remaining: max - 1 
      }, { location: 'rate-limit.checkLimit' });

      return {
        allowed: true,
        remaining: max - 1,
        resetTime
      };
    }

    if (record.count >= max) {
      Logger.warn('Rate limit exceeded', { 
        identifier: identifier.substring(0, 10) + '...', 
        count: record.count, 
        max,
        resetIn: Math.ceil((record.resetTime - now) / 1000)
      }, { location: 'rate-limit.checkLimit' });

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }

    record.count++;

    Logger.debug('Rate limit: Request allowed', { 
      identifier: identifier.substring(0, 10) + '...', 
      count: record.count,
      remaining: max - record.count 
    }, { location: 'rate-limit.checkLimit' });

    return {
      allowed: true,
      remaining: max - record.count,
      resetTime: record.resetTime
    };
  }

  async resetLimit(identifier: string): Promise<void> {
    delete this.store[identifier];
    Logger.info('Rate limit reset', { 
      identifier: identifier.substring(0, 10) + '...' 
    }, { location: 'rate-limit.resetLimit' });
  }

  getStats(): { totalKeys: number; store: Record<string, any> } {
    this.cleanupExpired();
    return {
      totalKeys: Object.keys(this.store).length,
      store: Object.entries(this.store).reduce((acc, [key, value]) => {
        acc[key.substring(0, 10) + '...'] = {
          count: value.count,
          resetIn: Math.max(0, Math.ceil((value.resetTime - Date.now()) / 1000))
        };
        return acc;
      }, {} as Record<string, any>)
    };
  }
}

export const rateLimiter = new RateLimiter();

export async function rateLimit(
  identifier: string,
  options?: { windowMs?: number; max?: number }
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  return rateLimiter.checkLimit(identifier, options);
}

export function createRateLimitKey(ip: string, email?: string): string {
  const baseKey = `rate_limit:${ip}`;
  return email ? `${baseKey}:${email}` : baseKey;
}

export function getRateLimitHeaders(result: { remaining: number; resetTime: number }) {
  const resetInSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
  
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'X-RateLimit-Reset-In': Math.max(0, resetInSeconds).toString()
  };
}
