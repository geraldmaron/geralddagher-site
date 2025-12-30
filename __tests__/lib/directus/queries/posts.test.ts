import { describe, it, expect } from 'vitest';

describe('Post Normalization', () => {
  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'post';
  }

  function normalizeCoverImage(coverImage: string | null | undefined): string | null | undefined {
    if (coverImage && typeof coverImage === 'string') {
      if (!coverImage.startsWith('http') && !coverImage.startsWith('/')) {
        return `/api/assets/${coverImage}`;
      }
    }
    return coverImage;
  }

  describe('slugify', () => {
    it('should convert title to slug', () => {
      expect(slugify('Test Post')).toBe('test-post');
      expect(slugify('Another Test Post')).toBe('another-test-post');
    });

    it('should handle special characters', () => {
      expect(slugify('Test & Post!')).toBe('test-post');
      expect(slugify('Test@Post#123')).toBe('test-post-123');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Test    Post')).toBe('test-post');
    });

    it('should trim leading and trailing dashes', () => {
      expect(slugify('---Test Post---')).toBe('test-post');
    });

    it('should return "post" for empty or invalid input', () => {
      expect(slugify('')).toBe('post');
      expect(slugify('!!!')).toBe('post');
    });
  });

  describe('normalizeCoverImage', () => {
    it('should normalize file ID to assets URL', () => {
      expect(normalizeCoverImage('abc-123-def')).toBe('/api/assets/abc-123-def');
      expect(normalizeCoverImage('file-uuid')).toBe('/api/assets/file-uuid');
    });

    it('should not modify URLs starting with http', () => {
      expect(normalizeCoverImage('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
      expect(normalizeCoverImage('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
    });

    it('should not modify URLs starting with /', () => {
      expect(normalizeCoverImage('/images/cover.jpg')).toBe('/images/cover.jpg');
      expect(normalizeCoverImage('/api/assets/123')).toBe('/api/assets/123');
    });

    it('should handle null and undefined', () => {
      expect(normalizeCoverImage(null)).toBe(null);
      expect(normalizeCoverImage(undefined)).toBe(undefined);
    });
  });
});
