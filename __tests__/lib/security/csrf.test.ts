import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  generateCSRFToken,
  validateCSRFToken,
  createCSRFHeaders,
} from '@/lib/security/csrf';

describe('CSRF Security', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalEnv !== undefined) {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    }
  });

  describe('generateCSRFToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('createCSRFHeaders', () => {
    it('should include Secure flag in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      const token = 'test-token';
      const headers = createCSRFHeaders(token);

      expect(headers['Set-Cookie']).toContain('Secure');
      expect(headers['Set-Cookie']).toContain('HttpOnly');
      expect(headers['Set-Cookie']).toContain('SameSite=Strict');
      expect(headers['Set-Cookie']).toContain(`csrf-token=${token}`);
      expect(headers['x-csrf-token']).toBe(token);
    });

    it('should not include Secure flag in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      const token = 'test-token';
      const headers = createCSRFHeaders(token);

      expect(headers['Set-Cookie']).not.toContain('Secure');
      expect(headers['Set-Cookie']).toContain('HttpOnly');
      expect(headers['Set-Cookie']).toContain('SameSite=Strict');
      expect(headers['Set-Cookie']).toContain(`csrf-token=${token}`);
    });

    it('should set correct cookie attributes', () => {
      const token = 'test-token';
      const headers = createCSRFHeaders(token);

      expect(headers['Set-Cookie']).toContain('Path=/');
      expect(headers['Set-Cookie']).toContain('HttpOnly');
      expect(headers['Set-Cookie']).toContain('SameSite=Strict');
    });
  });

  describe('validateCSRFToken', () => {
    it('should allow GET requests without CSRF token', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });

      expect(validateCSRFToken(request)).toBe(true);
    });

    it('should reject POST request without token in header', () => {
      const token = generateCSRFToken();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          Cookie: `csrf-token=${token}`,
        },
      });

      expect(validateCSRFToken(request)).toBe(false);
    });

    it('should reject POST request without token in cookie', () => {
      const token = generateCSRFToken();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
        },
      });

      expect(validateCSRFToken(request)).toBe(false);
    });

    it('should reject POST request with mismatched tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token1,
          Cookie: `csrf-token=${token2}`,
        },
      });

      expect(validateCSRFToken(request)).toBe(false);
    });

    it('should accept POST request with matching tokens', () => {
      const token = generateCSRFToken();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          Cookie: `csrf-token=${token}`,
        },
      });

      expect(validateCSRFToken(request)).toBe(true);
    });

    it('should validate PUT requests', () => {
      const token = generateCSRFToken();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'PUT',
        headers: {
          'x-csrf-token': token,
          Cookie: `csrf-token=${token}`,
        },
      });

      expect(validateCSRFToken(request)).toBe(true);
    });

    it('should validate DELETE requests', () => {
      const token = generateCSRFToken();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'DELETE',
        headers: {
          'x-csrf-token': token,
          Cookie: `csrf-token=${token}`,
        },
      });

      expect(validateCSRFToken(request)).toBe(true);
    });
  });
});
