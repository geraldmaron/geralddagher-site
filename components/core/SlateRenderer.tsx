'use client';
import React from 'react';
import Image from 'next/image';
import { FileIcon } from 'lucide-react';
interface SlateNode {
  type?: string;
  children?: SlateNode[];
  text?: string;
  url?: string;
  alt?: string;
  caption?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  link?: string;
  emoji?: string;
  level?: number;
  ordered?: boolean;
  depth?: number;
  checked?: boolean;
  [key: string]: any;
}
interface SlateRendererProps {
  content: SlateNode[] | { content: SlateNode[] };
  className?: string;
  compact?: boolean;
}
export default function SlateRenderer({ content, className = '', compact = false }: SlateRendererProps) {
  const normalizeContent = (rawContent: SlateNode[] | { content: SlateNode[] }): SlateNode[] => {
    if (!rawContent) return [];
    if (Array.isArray(rawContent)) {
      return rawContent;
    }
    if (typeof rawContent === 'object' && 'content' in rawContent) {
      return rawContent.content || [];
    }
    try {
      const parsed = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
      return Array.isArray(parsed) ? parsed : parsed.content || [];
    } catch {
      return [];
    }
  };
  const renderNode = (node: SlateNode, index: number): React.ReactNode => {
    if (!node) return null;
    if (typeof node === 'string') return node;
    if (node.text !== undefined) {
      let text: React.ReactNode = node.text;
      if (node.emoji) text = node.emoji;
      if (node.bold) text = <strong key={`bold-${index}`} className="font-semibold">{text}</strong>;
      if (node.italic) text = <em key={`italic-${index}`} className="italic">{text}</em>;
      if (node.underline) text = <u key={`underline-${index}`} className="underline">{text}</u>;
      if (node.strikethrough) text = <s key={`strike-${index}`} className="line-through">{text}</s>;
      if (node.code) text = <code key={`code-${index}`} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-quicksand">{text}</code>;
      if (node.link) {
        text = (
          <a
            key={`link-${index}`}
            href={node.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            {text}
          </a>
        );
      }
      return text;
    }
    const spacing = compact ? 'mb-2' : 'mb-4';
    const headingSpacing = compact ? 'mt-3 mb-2' : 'mt-6 mb-3';
    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className={`leading-relaxed text-gray-900 dark:text-gray-100 ${spacing}`}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </p>
        );
      case 'heading-one':
        return (
          <h1 key={index} className={`text-2xl font-quicksand font-semibold tracking-tight text-gray-900 dark:text-white ${headingSpacing}`}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </h1>
        );
      case 'heading-two':
        return (
          <h2 key={index} className={`text-xl font-quicksand font-semibold tracking-tight text-gray-900 dark:text-white ${headingSpacing}`}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </h2>
        );
      case 'heading-three':
        return (
          <h3 key={index} className={`text-lg font-quicksand font-semibold tracking-tight text-gray-900 dark:text-white ${headingSpacing}`}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </h3>
        );
      case 'block-quote':
        return (
          <blockquote key={index} className={`border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 ${spacing} bg-gray-50 dark:bg-gray-800/50 py-3 rounded-r-lg`}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </blockquote>
        );
      case 'code-block':
        return (
          <pre key={index} className={`bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto ${spacing} border border-gray-200 dark:border-gray-700`}>
            <code className="text-sm font-quicksand">
              {node.children?.map((child, i) => renderNode(child, i))}
            </code>
          </pre>
        );
      case 'bulleted-list':
        return (
          <ul key={index} className={`list-disc pl-6 space-y-1 text-gray-900 dark:text-gray-100 ${spacing} marker:text-blue-500`}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </ul>
        );
      case 'numbered-list':
        return (
          <ol key={index} className={`list-decimal pl-6 space-y-1 text-gray-900 dark:text-gray-100 ${spacing} marker:text-blue-500 marker:font-semibold`}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </ol>
        );
      case 'list-item':
        const listDepth = node.depth || 0;
        return (
          <li key={index} className="leading-relaxed" style={{ marginLeft: `${listDepth * 1.5}rem` }}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </li>
        );
      case 'todo-list':
        return (
          <div key={index} className={`space-y-2 ${spacing}`}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </div>
        );
      case 'todo-item':
        const todoDepth = node.depth || 0;
        return (
          <div key={index} className="flex items-start gap-2" style={{ marginLeft: `${todoDepth * 1.5}rem` }}>
            <input
              type="checkbox"
              checked={node.checked || false}
              readOnly
              className="mt-1 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500 dark:bg-neutral-800 dark:checked:bg-blue-600 dark:checked:border-blue-600 pointer-events-none"
            />
            <div className="flex-1 text-neutral-900 dark:text-neutral-100">
              {node.children?.map((child, i) => renderNode(child, i))}
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={index} className={`${compact ? 'my-3' : 'my-6'}`}>
            <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              {node.url ? (
                <Image
                  src={node.url}
                  alt={node.alt || ''}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FileIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            {node.caption && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center italic">
                {node.caption}
              </p>
            )}
          </div>
        );
      case 'video':
        return (
          <div key={index} className={`${compact ? 'my-3' : 'my-6'}`}>
            <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              {node.url ? (
                <video
                  controls
                  className="w-full h-auto"
                  poster={node.poster}
                >
                  <source src={node.url} type={node.mimeType || 'video/mp4'} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FileIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            {node.caption && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center italic">
                {node.caption}
              </p>
            )}
          </div>
        );
      case 'table':
        return (
          <div key={index} className={`overflow-x-auto ${spacing}`}>
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <tbody>
                {node.children?.map((row, i) => (
                  <tr key={i} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    {(row as SlateNode).children?.map((cell, j) => (
                      <td key={j} className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                        {(cell as SlateNode).children?.map((child, k) => renderNode(child, k))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return node.children?.map((child, i) => renderNode(child, i));
    }
  };
  const nodes = normalizeContent(content);
  if (!nodes.length) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 italic text-center py-8 ${className}`}>
        No content available
      </div>
    );
  }
  return (
    <div className={`prose prose-gray dark:prose-invert max-w-none ${className}`}>
      {nodes.map((node, index) => renderNode(node, index))}
    </div>
  );
}