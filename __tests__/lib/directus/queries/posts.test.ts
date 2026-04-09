import { describe, it, expect } from 'vitest';
import { generateSlug } from '@/lib/utils/slug';

describe('generateSlug', () => {
  it('converts title to slug', () => {
    expect(generateSlug('Test Post')).toBe('test-post');
    expect(generateSlug('Another Test Post')).toBe('another-test-post');
  });

  it('handles special characters', () => {
    expect(generateSlug('Test & Post!')).toBe('test-post');
    expect(generateSlug('Test@Post#123')).toBe('test-post-123');
  });

  it('handles multiple spaces', () => {
    expect(generateSlug('Test    Post')).toBe('test-post');
  });

  it('trims leading and trailing dashes', () => {
    expect(generateSlug('---Test Post---')).toBe('test-post');
  });

  it('returns empty string for empty input', () => {
    expect(generateSlug('')).toBe('');
  });

  it('returns empty string for symbol-only input', () => {
    expect(generateSlug('!!!')).toBe('');
  });
});
