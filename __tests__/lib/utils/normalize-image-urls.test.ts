import { describe, it, expect } from 'vitest';
import { normalizeImageUrls } from '@/lib/utils/normalize-image-urls';

describe('normalizeImageUrls', () => {
  it('returns falsy values unchanged', () => {
    expect(normalizeImageUrls(null)).toBeNull();
    expect(normalizeImageUrls(undefined)).toBeUndefined();
    expect(normalizeImageUrls('')).toBe('');
  });

  it('strips host from /api/assets/ URLs', () => {
    const node = {
      type: 'image',
      url: 'https://example.com/api/assets/abc-123',
      children: [],
    };
    const result = normalizeImageUrls(node);
    expect(result.url).toBe('/api/assets/abc-123');
  });

  it('leaves relative /api/assets/ paths unchanged', () => {
    const node = { type: 'image', url: '/api/assets/abc-123', children: [] };
    expect(normalizeImageUrls(node).url).toBe('/api/assets/abc-123');
  });

  it('leaves external URLs that are not /api/assets/ unchanged', () => {
    const node = { type: 'image', url: 'https://cdn.example.com/image.jpg', children: [] };
    expect(normalizeImageUrls(node).url).toBe('https://cdn.example.com/image.jpg');
  });

  it('leaves blob: URLs unchanged', () => {
    const node = { type: 'image', url: 'blob:http://localhost/abc', children: [] };
    expect(normalizeImageUrls(node).url).toBe('blob:http://localhost/abc');
  });

  it('does not modify non-image nodes', () => {
    const node = { type: 'paragraph', url: 'https://example.com/api/assets/abc', children: [] };
    expect(normalizeImageUrls(node).url).toBe('https://example.com/api/assets/abc');
  });

  it('recursively normalizes nested children', () => {
    const doc = {
      type: 'doc',
      children: [
        { type: 'image', url: 'https://example.com/api/assets/nested', children: [] },
      ],
    };
    const result = normalizeImageUrls(doc);
    expect(result.children[0].url).toBe('/api/assets/nested');
  });

  it('processes arrays of nodes', () => {
    const nodes = [
      { type: 'image', url: 'https://example.com/api/assets/a', children: [] },
      { type: 'image', url: '/api/assets/b', children: [] },
    ];
    const result = normalizeImageUrls(nodes);
    expect(result[0].url).toBe('/api/assets/a');
    expect(result[1].url).toBe('/api/assets/b');
  });

  it('does not mutate the original node', () => {
    const node = { type: 'image', url: 'https://example.com/api/assets/abc', children: [] };
    const copy = { ...node };
    normalizeImageUrls(node);
    expect(node.url).toBe(copy.url);
  });
});
