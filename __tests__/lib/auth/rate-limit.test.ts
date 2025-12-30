import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/auth/rate-limit';

describe('Rate Limit', () => {
  const testIdentifier = 'test-user';

  beforeEach(() => {
    vi.useFakeTimers();
    clearRateLimit(testIdentifier);
  });

  afterEach(() => {
    vi.useRealTimers();
    clearRateLimit(testIdentifier);
  });

  describe('checkRateLimit', () => {
    it('should allow first attempt', () => {
      const result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should allow multiple attempts within limit', () => {
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(testIdentifier);
        expect(result.allowed).toBe(true);
      }
    });

    it('should block after exceeding max attempts', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIdentifier);
      }

      const result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIdentifier);
      }

      checkRateLimit(testIdentifier);

      vi.advanceTimersByTime(31 * 60 * 1000);

      const result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(true);
    });

    it('should handle different identifiers independently', () => {
      const identifier1 = 'user1';
      const identifier2 = 'user2';

      for (let i = 0; i < 6; i++) {
        checkRateLimit(identifier1);
      }

      const result = checkRateLimit(identifier2);
      expect(result.allowed).toBe(true);

      clearRateLimit(identifier1);
      clearRateLimit(identifier2);
    });

    it('should reset count after rate limit window expires', () => {
      checkRateLimit(testIdentifier);
      checkRateLimit(testIdentifier);

      vi.advanceTimersByTime(16 * 60 * 1000);

      const result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(true);
    });

    it('should provide retry after value when blocked', () => {
      for (let i = 0; i < 6; i++) {
        checkRateLimit(testIdentifier);
      }

      const result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should record a failed attempt', () => {
      recordFailedAttempt(testIdentifier);
      recordFailedAttempt(testIdentifier);

      const result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(true);
    });

    it('should contribute to rate limit', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(testIdentifier);
      }

      const result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(false);
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit for identifier', () => {
      for (let i = 0; i < 6; i++) {
        checkRateLimit(testIdentifier);
      }

      let result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(false);

      clearRateLimit(testIdentifier);

      result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(true);
    });

    it('should only clear specified identifier', () => {
      const identifier1 = 'user1';
      const identifier2 = 'user2';

      for (let i = 0; i < 6; i++) {
        checkRateLimit(identifier1);
        checkRateLimit(identifier2);
      }

      clearRateLimit(identifier1);

      const result1 = checkRateLimit(identifier1);
      const result2 = checkRateLimit(identifier2);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(false);

      clearRateLimit(identifier2);
    });
  });
});
