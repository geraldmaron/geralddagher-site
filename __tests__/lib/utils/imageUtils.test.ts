import { describe, it, expect } from 'vitest';
import { getSafeImageUrl, migrateImageUrl } from '@/lib/utils/imageUtils';

describe('imageUtils', () => {
  describe('migrateImageUrl', () => {
    it('should return null for null input', () => {
      expect(migrateImageUrl(null)).toBe(null);
    });

    it('should preserve Appwrite URLs', () => {
      const url = 'http://167.99.174.79/storage/files/abc';
      expect(migrateImageUrl(url)).toBe(url);
    });

    it('should preserve cloud.appwrite.io URLs', () => {
      const url = 'https://cloud.appwrite.io/v1/storage/files/abc';
      expect(migrateImageUrl(url)).toBe(url);
    });

    it('should replace Supabase URLs with logo', () => {
      const url = 'https://supabase.co/storage/v1/object/public/images/test.jpg';
      expect(migrateImageUrl(url)).toBe('/Dagher_Logo_2024_Mark.png');
    });

    it('should preserve other URLs', () => {
      const url = 'https://example.com/image.jpg';
      expect(migrateImageUrl(url)).toBe(url);
    });
  });

  describe('getSafeImageUrl', () => {
    it('should return logo for null input', () => {
      expect(getSafeImageUrl(null)).toBe('/Dagher_Logo_2024_Mark.png');
    });

    it('should preserve http URLs', () => {
      const url = 'https://example.com/image.jpg';
      expect(getSafeImageUrl(url)).toBe(url);
    });

    it('should preserve https URLs', () => {
      const url = 'https://example.com/image.jpg';
      expect(getSafeImageUrl(url)).toBe(url);
    });

    it('should preserve relative paths starting with /', () => {
      expect(getSafeImageUrl('/images/cover.jpg')).toBe('/images/cover.jpg');
      expect(getSafeImageUrl('/api/assets/123')).toBe('/api/assets/123');
    });

    it('should convert Directus file IDs to asset URLs', () => {
      expect(getSafeImageUrl('abc-123-def')).toBe('/api/assets/abc-123-def');
      expect(getSafeImageUrl('file-uuid-456')).toBe('/api/assets/file-uuid-456');
    });

    it('should handle Appwrite URLs through migration', () => {
      const url = 'http://167.99.174.79/storage/files/abc';
      expect(getSafeImageUrl(url)).toBe(url);
    });

    it('should convert Supabase URLs to logo through migration', () => {
      const url = 'https://supabase.co/storage/v1/object/public/images/test.jpg';
      expect(getSafeImageUrl(url)).toBe('/Dagher_Logo_2024_Mark.png');
    });

    it('should handle already normalized asset URLs', () => {
      expect(getSafeImageUrl('/api/assets/directus/abc-123')).toBe('/api/assets/directus/abc-123');
    });
  });
});
