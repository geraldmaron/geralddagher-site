import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  createSubscriptionSchema,
  confirmSubscriptionSchema,
  unsubscribeSchema,
  brevoWebhookSchema,
} from '@/lib/validation/subscription';

describe('emailSchema', () => {
  it('should validate a valid email', () => {
    const result = emailSchema.safeParse('test@example.com');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });

  it('should trim and lowercase email', () => {
    const result = emailSchema.safeParse('TEST@EXAMPLE.COM');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });

  it('should reject invalid email', () => {
    const result = emailSchema.safeParse('invalid-email');
    expect(result.success).toBe(false);
  });

  it('should reject empty string', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('should reject email that is too long', () => {
    const longEmail = 'a'.repeat(320) + '@example.com';
    const result = emailSchema.safeParse(longEmail);
    expect(result.success).toBe(false);
  });
});

describe('createSubscriptionSchema', () => {
  it('should validate with blog subscription', () => {
    const result = createSubscriptionSchema.safeParse({
      email: 'test@example.com',
      blog: true,
      substack: false,
    });
    expect(result.success).toBe(true);
  });

  it('should validate with substack subscription', () => {
    const result = createSubscriptionSchema.safeParse({
      email: 'test@example.com',
      blog: false,
      substack: true,
    });
    expect(result.success).toBe(true);
  });

  it('should validate with both subscriptions', () => {
    const result = createSubscriptionSchema.safeParse({
      email: 'test@example.com',
      blog: true,
      substack: true,
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional firstName and lastName', () => {
    const result = createSubscriptionSchema.safeParse({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      blog: true,
      substack: false,
    });
    expect(result.success).toBe(true);
  });

  it('should reject when neither blog nor substack is selected', () => {
    const result = createSubscriptionSchema.safeParse({
      email: 'test@example.com',
      blog: false,
      substack: false,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = createSubscriptionSchema.safeParse({
      email: 'invalid',
      blog: true,
      substack: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('confirmSubscriptionSchema', () => {
  it('should validate valid hex token', () => {
    const result = confirmSubscriptionSchema.safeParse({
      token: 'abc123def456',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty token', () => {
    const result = confirmSubscriptionSchema.safeParse({
      token: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-hex token', () => {
    const result = confirmSubscriptionSchema.safeParse({
      token: 'not-hex-token!',
    });
    expect(result.success).toBe(false);
  });

  it('should reject token that is too long', () => {
    const result = confirmSubscriptionSchema.safeParse({
      token: 'a'.repeat(129),
    });
    expect(result.success).toBe(false);
  });
});

describe('unsubscribeSchema', () => {
  it('should validate with blog target', () => {
    const result = unsubscribeSchema.safeParse({
      email: 'test@example.com',
      target: 'blog',
    });
    expect(result.success).toBe(true);
  });

  it('should validate with substack target', () => {
    const result = unsubscribeSchema.safeParse({
      email: 'test@example.com',
      target: 'substack',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid target', () => {
    const result = unsubscribeSchema.safeParse({
      email: 'test@example.com',
      target: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = unsubscribeSchema.safeParse({
      email: 'invalid',
      target: 'blog',
    });
    expect(result.success).toBe(false);
  });
});

describe('brevoWebhookSchema', () => {
  it('should validate delivered event', () => {
    const result = brevoWebhookSchema.safeParse({
      event: 'delivered',
      email: 'test@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should validate with optional fields', () => {
    const result = brevoWebhookSchema.safeParse({
      event: 'bounced',
      email: 'test@example.com',
      date: '2025-01-01',
      'message-id': '123',
      messageId: '123',
      reason: 'Hard bounce',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid event type', () => {
    const result = brevoWebhookSchema.safeParse({
      event: 'invalid',
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('should validate all event types', () => {
    const events = ['delivered', 'bounced', 'unsubscribed', 'opened', 'clicked'];
    events.forEach((event) => {
      const result = brevoWebhookSchema.safeParse({
        event,
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });
  });
});
