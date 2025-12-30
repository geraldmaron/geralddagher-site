import { describe, it, expect } from 'vitest';
import { calculateReadingTime, getPlainTextFromSlate } from '@/lib/utils/readingTime';

describe('calculateReadingTime', () => {
  it('should return 1 minute for null content', () => {
    expect(calculateReadingTime(null)).toBe(1);
  });

  it('should return 1 minute for empty string', () => {
    expect(calculateReadingTime('')).toBe(1);
  });

  it('should calculate reading time for plain string', () => {
    const text = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(text)).toBe(1);
  });

  it('should calculate reading time for 400 words', () => {
    const text = Array(400).fill('word').join(' ');
    expect(calculateReadingTime(text)).toBe(2);
  });

  it('should calculate reading time for Slate content', () => {
    const slateContent = {
      type: 'slate',
      content: [
        { text: Array(100).fill('word').join(' ') },
        { text: Array(100).fill('word').join(' ') }
      ]
    };
    expect(calculateReadingTime(slateContent)).toBe(1);
  });

  it('should handle Slate content with children', () => {
    const slateContent = {
      type: 'slate',
      content: [
        {
          type: 'paragraph',
          children: [
            { text: Array(200).fill('word').join(' ') }
          ]
        }
      ]
    };
    expect(calculateReadingTime(slateContent)).toBe(1);
  });

  it('should handle direct array of Slate nodes', () => {
    const directArray = [
      {
        type: 'paragraph',
        children: [
          { text: Array(200).fill('word').join(' ') }
        ]
      }
    ];
    expect(calculateReadingTime(directArray)).toBe(1);
  });

  it('should use 200 words per minute', () => {
    const text = Array(201).fill('word').join(' ');
    expect(calculateReadingTime(text)).toBe(2);
  });

  it('should round up partial minutes', () => {
    const text = Array(250).fill('word').join(' ');
    expect(calculateReadingTime(text)).toBe(2);
  });
});

describe('getPlainTextFromSlate', () => {
  it('should return empty string for null', () => {
    expect(getPlainTextFromSlate(null)).toBe('');
  });

  it('should return plain string as is', () => {
    expect(getPlainTextFromSlate('hello world')).toBe('hello world');
  });

  it('should extract text from Slate content', () => {
    const slateContent = {
      type: 'slate',
      content: [
        { text: 'hello' },
        { text: ' world' }
      ]
    };
    expect(getPlainTextFromSlate(slateContent)).toBe('hello world');
  });

  it('should truncate text to maxLength', () => {
    const text = 'a'.repeat(200);
    const result = getPlainTextFromSlate(text, 10);
    expect(result).toBe('aaaaaaaaa…');
  });

  it('should extract text from nested children', () => {
    const slateContent = {
      type: 'slate',
      content: [
        {
          type: 'paragraph',
          children: [
            { text: 'hello' },
            { text: ' world' }
          ]
        }
      ]
    };
    expect(getPlainTextFromSlate(slateContent)).toBe('hello world');
  });

  it('should handle direct array of nodes', () => {
    const directArray = [
      {
        type: 'paragraph',
        children: [
          { text: 'hello' },
          { text: ' world' }
        ]
      }
    ];
    expect(getPlainTextFromSlate(directArray)).toBe('hello world');
  });
});
