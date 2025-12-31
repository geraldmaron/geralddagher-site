import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/subscriptions/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/directus/queries', () => ({
  createSubscription: vi.fn().mockResolvedValue({ id: '1' }),
  findSubscriptionByEmail: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/email/brevo', () => ({
  getBrevoProvider: vi.fn(() => ({
    sendConfirmationEmail: vi.fn().mockResolvedValue(true),
  })),
}));

vi.mock('@/lib/substack/link', () => ({
  getSubstackProvider: vi.fn(() => ({
    buildSubscribeUrl: vi.fn(() => 'https://substack.com/subscribe?email=test@example.com'),
  })),
}));

vi.mock('@/lib/utils/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  createRateLimitKey: vi.fn((ip, email) => `${ip}:${email}`),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock('@/lib/security/csrf', () => ({
  validateCSRFToken: vi.fn(() => true),
  generateCSRFToken: vi.fn(() => 'test-csrf-token'),
  createCSRFHeaders: vi.fn((token) => ({
    'Set-Cookie': `csrf-token=${token}`,
    'x-csrf-token': token,
  })),
}));

vi.mock('@/lib/utils/logger', () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Subscriptions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/subscriptions', () => {
    it('should return CSRF token', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.csrfToken).toBe('test-csrf-token');
      expect(response.headers.get('Set-Cookie')).toContain('csrf-token=test-csrf-token');
    });
  });

  describe('POST /api/subscriptions', () => {
    it('should create blog subscription successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'test-token',
          Cookie: 'csrf-token=test-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          blog: true,
          substack: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('check your email');
    });

    it('should create substack subscription and return redirect URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'test-token',
          Cookie: 'csrf-token=test-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          blog: false,
          substack: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.substackRedirectUrl).toContain('substack.com');
    });

    it('should handle both blog and substack subscriptions', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'test-token',
          Cookie: 'csrf-token=test-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          blog: true,
          substack: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.substackRedirectUrl).toBeDefined();
    });

    it('should reject request without CSRF token', async () => {
      const { validateCSRFToken } = await import('@/lib/security/csrf');
      vi.mocked(validateCSRFToken).mockReturnValueOnce(false);

      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          blog: true,
          substack: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid request');
    });

    it('should reject invalid email', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'test-token',
          Cookie: 'csrf-token=test-token',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          blog: true,
          substack: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid request data');
    });

    it('should reject when neither blog nor substack is selected', async () => {
      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'test-token',
          Cookie: 'csrf-token=test-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          blog: false,
          substack: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle rate limiting', async () => {
      const { rateLimit } = await import('@/lib/utils/rate-limit');
      vi.mocked(rateLimit).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
      });

      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'test-token',
          Cookie: 'csrf-token=test-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          blog: true,
          substack: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Too many requests');
    });

    it('should handle existing active blog subscription', async () => {
      const { findSubscriptionByEmail } = await import('@/lib/directus/queries');
      vi.mocked(findSubscriptionByEmail).mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        status: 'active',
        type: 'blog',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'test-token',
          Cookie: 'csrf-token=test-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          blog: true,
          substack: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('already subscribed');
    });
  });
});
