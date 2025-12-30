/**
 * Reading Time Calculation Utilities
 * 
 * Functions for calculating reading time and extracting plain text
 * from various content formats including Slate editor content.
 */

import type { SlateContent } from '@/lib/types/database';
import type { Descendant } from 'slate';

/**
 * Calculates estimated reading time for content
 * 
 * @param content - Content to analyze (string, SlateContent, or null)
 * @returns Reading time in minutes (minimum 1 minute)
 */
export function calculateReadingTime(content: string | SlateContent | null | any): number {
  if (!content) return 1;

  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (Array.isArray(content)) {
    text = content
      .map((node: any) => {
        if (typeof node === 'string') return node;
        if ('text' in node) return node.text;
        if ('children' in node) {
          return node.children
            .map((child: any) => typeof child === 'string' ? child : 'text' in child ? child.text : '')
            .join(' ');
        }
        return '';
      })
      .join(' ')
      .trim();
  } else if (content.type === 'slate' && Array.isArray(content.content)) {
    text = content.content
      .map((node: Descendant) => {
        if (typeof node === 'string') return node;
        if ('text' in node) return node.text;
        if ('children' in node) {
          return node.children
            .map((child: Descendant) => typeof child === 'string' ? child : 'text' in child ? child.text : '')
            .join(' ');
        }
        return '';
      })
      .join(' ')
      .trim();
  } else {
    text = JSON.stringify(content);
  }

  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return Math.max(1, readingTime);
}

/**
 * Recursively extracts text content from Slate node structure
 * 
 * @param node - Slate node to extract text from
 * @returns Extracted text string
 */
function extractTextFromNode(node: any): string {
  if (typeof node === 'string') return node;
  
  let text = '';
  if ('text' in node) {
    text += node.text;
    if ('emoji' in node && node.emoji) {
      text += node.emoji;
    }
  }
  
  if ('children' in node && Array.isArray(node.children)) {
    text += ' ' + node.children.map(extractTextFromNode).join(' ');
  }
  
  return text.trim();
}

/**
 * Extracts plain text from Slate content with length limit
 * 
 * @param content - Content to extract text from
 * @param maxLength - Maximum length of extracted text (default: 160)
 * @returns Plain text string truncated to maxLength
 */
export function getPlainTextFromSlate(content: string | SlateContent | null | any, maxLength: number = 160): string {
  if (!content) return '';
  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (Array.isArray(content)) {
    text = content.map(extractTextFromNode).join(' ').replace(/\s+/g, ' ').trim();
  } else if (content.type === 'slate' && Array.isArray(content.content)) {
    text = content.content.map(extractTextFromNode).join(' ').replace(/\s+/g, ' ').trim();
  } else {
    text = JSON.stringify(content);
  }
  if (text.length > maxLength) {
    return text.slice(0, maxLength - 1).trim() + '…';
  }
  return text;
} 
export const findSearchMatch = (content: any, query: string, maxLength: number = 200): string => {
  if (!query.trim()) return '';
  const plainText = getPlainTextFromSlate(content, 2000);
  const lowerQuery = query.toLowerCase();
  const lowerText = plainText.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);
  if (matchIndex === -1) return '';
  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(plainText.length, start + maxLength);
  let excerpt = plainText.slice(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < plainText.length) excerpt = excerpt + '...';
  return excerpt;
};