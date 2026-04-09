import { describe, it, expect } from 'vitest';
import { formatDate, formatISODate, getPostDate } from '@/lib/utils/date';
import type { Post } from '@/lib/types/shared';

describe('formatDate', () => {
  it('formats a date in US English long format', () => {
    const date = new Date(2024, 2, 15);
    expect(formatDate(date)).toMatch(/March 15, 2024/);
  });

  it('formats dates across different months', () => {
    expect(formatDate(new Date(2024, 0, 15))).toMatch(/January 15, 2024/);
    expect(formatDate(new Date(2024, 11, 15))).toMatch(/December 15, 2024/);
  });
});

describe('formatISODate', () => {
  it('returns ISO 8601 string', () => {
    const date = new Date('2024-06-15T12:00:00.000Z');
    expect(formatISODate(date)).toBe('2024-06-15T12:00:00.000Z');
  });

  it('round-trips through Date constructor', () => {
    const now = new Date();
    expect(new Date(formatISODate(now)).getTime()).toBe(now.getTime());
  });
});

describe('getPostDate', () => {
  const base: Partial<Post> = {
    created_at: '2024-01-01T00:00:00.000Z',
  };

  it('returns published_at when available', () => {
    const post = { ...base, published_at: '2024-06-01T00:00:00.000Z' } as Post;
    expect(getPostDate(post).toISOString()).toBe('2024-06-01T00:00:00.000Z');
  });

  it('falls back to created_at when published_at is absent', () => {
    const post = { ...base } as Post;
    expect(getPostDate(post).toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });

  it('falls back to created_at when published_at is null', () => {
    const post = { ...base, published_at: null } as unknown as Post;
    expect(getPostDate(post).toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });
});
