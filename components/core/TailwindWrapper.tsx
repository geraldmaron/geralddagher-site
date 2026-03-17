'use client';
import React, { useEffect, ReactElement, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { useTheme } from '@/components/core/ThemeProvider';
import { motion } from 'framer-motion';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';

interface TailwindHTMLWrapperProps {
  content: string | ReactElement | ReactNode;
}

const TailwindHTMLWrapper: React.FC<TailwindHTMLWrapperProps> = ({ content }) => {
  const { isDarkMode } = useTheme();
  const sanitizedContent = typeof content === 'string' ? DOMPurify.sanitize(content, { USE_PROFILES: { html: true } }) : content;

  useEffect(() => {
    Prism.highlightAll();
  }, [content]);

  const enhanceWithTailwind = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach((p) => {
      p.classList.add(
        'leading-relaxed',
        'mb-4',
        isDarkMode ? 'text-gray-300' : 'text-gray-600',
        'transition-colors',
        'duration-300'
      );
    });

    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
      heading.classList.add('font-semibold', 'tracking-tight', 'mb-4', 'transition-colors', 'duration-300', isDarkMode ? 'text-white' : 'text-gray-900');
      switch (heading.tagName.toLowerCase()) {
        case 'h1': heading.classList.add('text-4xl', 'sm:text-5xl', 'md:text-6xl'); break;
        case 'h2': heading.classList.add('text-3xl', 'sm:text-4xl', 'md:text-5xl'); break;
        case 'h3': heading.classList.add('text-2xl', 'sm:text-3xl', 'md:text-4xl'); break;
        case 'h4': heading.classList.add('text-xl', 'sm:text-2xl', 'md:text-3xl'); break;
        case 'h5': heading.classList.add('text-lg', 'sm:text-xl', 'md:text-2xl'); break;
        case 'h6': heading.classList.add('text-base', 'sm:text-lg', 'md:text-xl'); break;
      }
    });

    const lists = tempDiv.querySelectorAll('ul, ol');
    lists.forEach((list) => {
      list.classList.add('list-disc', 'ml-8', 'mb-4', isDarkMode ? 'text-gray-300' : 'text-gray-600');
    });

    const images = tempDiv.querySelectorAll('img');
    images.forEach((img) => {
      img.classList.add('max-w-full', 'h-auto', 'rounded-xl', 'my-4', 'cursor-pointer', 'transition-transform', 'duration-300', 'hover:scale-105');
      img.setAttribute('loading', 'lazy');
      if (!img.getAttribute('alt')) {
        img.setAttribute('alt', 'Blog post image');
      }
      img.onerror = () => {
        img.src = '/images/fallback.jpg';
        img.classList.add('opacity-50');
      };
    });

    const blockquotes = tempDiv.querySelectorAll('blockquote');
    blockquotes.forEach((blockquote) => {
      blockquote.classList.add(
        'my-8',
        'p-4',
        'border-s-4',
        'italic',
        'leading-relaxed',
        isDarkMode ? 'bg-blue-900/30 border-blue-600 text-gray-300' : 'bg-blue-50/50 border-blue-300 text-gray-600'
      );
    });

    const preTags = tempDiv.querySelectorAll('pre');
    preTags.forEach((pre) => {
      pre.classList.add('relative', 'rounded-xl', 'overflow-hidden', 'my-4');
      const code = pre.querySelector('code');
      if (code) {
        const language = code.className.replace('language-', '');
        code.classList.add(`language-${language}`);
        const copyButton = document.createElement('button');
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
        copyButton.classList.add('absolute', 'top-2', 'end-2', 'bg-primary', 'text-primary-foreground', 'p-1.5', 'rounded-md', 'opacity-70', 'hover:opacity-100', 'transition-opacity');
        copyButton.onclick = () => {
          navigator.clipboard.writeText(code.textContent || '');
        };
        pre.appendChild(copyButton);
      }
    });

    const codeTags = tempDiv.querySelectorAll('code');
    codeTags.forEach((code) => {
      code.classList.add('px-1.5', 'py-0.5', 'rounded-md', isDarkMode ? 'bg-blue-900/30 text-gray-300' : 'bg-blue-50/60 text-gray-700');
    });

    const tables = tempDiv.querySelectorAll('table');
    tables.forEach((table) => {
      table.classList.add('w-full', 'border-collapse', 'mb-4', isDarkMode ? 'text-gray-300' : 'text-gray-700');
      const th = table.querySelectorAll('th');
      th.forEach((header) => {
        header.classList.add('border', 'p-2', 'text-start', 'font-semibold', isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200');
      });
      const td = table.querySelectorAll('td');
      td.forEach((cell) => {
        cell.classList.add('border', 'p-2', isDarkMode ? 'border-gray-700' : 'border-gray-200');
      });
      const tr = table.querySelectorAll('tr:nth-child(even)');
      tr.forEach((row) => {
        row.classList.add(isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/60');
      });
    });

    const anchors = tempDiv.querySelectorAll('a');
    anchors.forEach((a) => {
      a.classList.add('text-primary', 'hover:text-primary/80', 'font-medium', 'hover:underline', 'underline-offset-4', 'transition-colors', 'duration-200');
    });

    const iframes = tempDiv.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      iframe.classList.add('w-full', 'my-8', 'rounded-xl', 'shadow-lg');
      if (iframe.src.includes('spotify.com')) {
        iframe.classList.add('h-80');
      } else if (iframe.src.includes('youtube.com')) {
        iframe.classList.add('aspect-video');
      }
      if (!iframe.getAttribute('title')) {
        iframe.setAttribute('title', 'Embedded content');
      }
    });

    const strongTags = tempDiv.querySelectorAll('strong');
    strongTags.forEach((strong) => {
      strong.classList.add('font-semibold', isDarkMode ? 'text-white' : 'text-gray-900');
    });

    return tempDiv.innerHTML;
  };

  const finalContent = typeof sanitizedContent === 'string' ? enhanceWithTailwind(sanitizedContent) : sanitizedContent;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`prose ${isDarkMode ? 'prose-dark' : ''} max-w-none`}
      dangerouslySetInnerHTML={typeof finalContent === 'string' ? { __html: finalContent } : undefined}
    >
      {typeof finalContent !== 'string' && finalContent}
    </motion.div>
  );
};

export default TailwindHTMLWrapper;
