import React from 'react';
import { Element as SlateElement } from 'slate';
import { cn } from '@/lib/utils';

interface EditorElementProps {
  attributes: any;
  children: React.ReactNode;
  element: any;
}

export const EditorElement: React.FC<EditorElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const style = { textAlign: element.align || 'left' };

  switch (element.type) {
    case 'callout':
      return (
        <div {...attributes} style={style} className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-3 my-3 rounded-lg flex items-start gap-2">
          <span className="text-yellow-500 dark:text-yellow-300 text-xl flex-shrink-0">💡</span>
          <div className="flex-1 leading-normal">{children}</div>
        </div>
      );
    case 'todo-list':
      return (
        <ul {...attributes} style={style} className="list-none pl-0 my-2 space-y-1">
          {children}
        </ul>
      );
    case 'todo-item': {
      const todoDepth = element.depth || 0;
      const todoIndentStyle = {
        ...style,
        marginLeft: `${todoDepth * 1.5}rem`
      };
      return (
        <li {...attributes} style={todoIndentStyle} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={!!element.checked}
            readOnly
            className="mt-1 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500 dark:bg-neutral-800 dark:checked:bg-blue-600 dark:checked:border-blue-600 flex-shrink-0"
          />
          <span className={element.checked ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-100'}>{children}</span>
        </li>
      );
    }
    case 'toggle-list':
      return (
        <div {...attributes} style={style} className="mb-4">
          {children}
        </div>
      );
    case 'toggle-item':
      return (
        <details {...attributes} open={!element.collapsed} className="mb-2">
          <summary className="cursor-pointer select-none font-semibold text-neutral-700 dark:text-neutral-200">Toggle</summary>
          <div className="pl-4">{children}</div>
        </details>
      );
    case 'table':
      return (
        <table {...attributes} className="my-3 border border-neutral-300 dark:border-neutral-700 w-full text-left text-sm">
          <tbody>{children}</tbody>
        </table>
      );
    case 'table-row':
      return <tr {...attributes}>{children}</tr>;
    case 'table-cell':
      return <td {...attributes} className="border border-neutral-300 dark:border-neutral-700 px-2 py-1">{children}</td>;
    case 'heading-one':
      return (
        <h1 {...attributes} style={style} className="text-3xl font-bold leading-tight mt-6 mb-3 text-gray-900 dark:text-white">
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 {...attributes} style={style} className="text-2xl font-bold leading-tight mt-5 mb-2 text-gray-900 dark:text-white">
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 {...attributes} style={style} className="text-xl font-bold leading-snug mt-4 mb-2 text-gray-900 dark:text-white">
          {children}
        </h3>
      );
    
    case 'heading-four':
      return (
        <h4 {...attributes} style={style} className="text-lg font-bold leading-snug mt-3 mb-1 text-gray-900 dark:text-white">
          {children}
        </h4>
      );
    
    case 'heading-five':
      return (
        <h5 {...attributes} style={style} className="text-base font-bold leading-snug mt-3 mb-1 text-gray-900 dark:text-white">
          {children}
        </h5>
      );
    
    case 'heading-six':
      return (
        <h6 {...attributes} style={style} className="text-sm font-bold leading-normal mt-2 mb-1 text-gray-900 dark:text-white uppercase tracking-wide">
          {children}
        </h6>
      );
    case 'block-quote':
      return (
        <blockquote
          {...attributes}
          style={style}
          className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 my-3 italic leading-normal"
        >
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul {...attributes} style={style} className="list-disc pl-6 my-2 ml-0 space-y-0.5">
          {children}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol {...attributes} style={style} className="list-decimal pl-6 my-2 ml-0 space-y-0.5">
          {children}
        </ol>
      );
    case 'list-item': {
      const depth = element.depth || 0;
      const indentStyle = {
        ...style,
        marginLeft: `${depth * 1.5}rem`
      };
      return (
        <li {...attributes} style={indentStyle} className="leading-normal">
          {children}
        </li>
      );
    }
    case 'code-block':
      return (
        <pre
          {...attributes}
          style={style}
          className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg overflow-x-auto my-3 text-sm leading-normal"
        >
          <code>{children}</code>
        </pre>
      );
    case 'divider':
      return (
        <div {...attributes} contentEditable={false} className="my-4">
          <hr className="border-0 border-t-2 border-neutral-300 dark:border-neutral-600" />
          {children}
        </div>
      );
    case 'link':
      return (
        <a
          {...attributes}
          href={element.url}
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    case 'image':
      if (!element.url) {
        return (
          <div {...attributes} className="my-3 p-4 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">Image URL is missing</p>
          </div>
        );
      }
      return (
        <div {...attributes} className="my-3">
          <img
            src={element.url}
            alt={element.alt || ''}
            className="max-w-full h-auto rounded-lg"
            contentEditable={false}
            onError={(e) => {
              console.error('Failed to load image:', element.url);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'p-2 border border-red-300 dark:border-red-700 rounded bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400';
              errorDiv.textContent = `Failed to load image: ${element.url}`;
              target.parentElement?.appendChild(errorDiv);
            }}
          />
        </div>
      );
    case 'video':
      return (
        <div {...attributes} className="my-3">
          <video
            src={element.url}
            controls
            className="max-w-full h-auto rounded-lg"
            contentEditable={false}
          />
        </div>
      );
    case 'file':
      return (
        <div {...attributes} className="my-3">
          <a
            href={element.url}
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            {children}
          </a>
        </div>
      );
    default:
      return (
        <p {...attributes} style={style} className="leading-normal my-2">
          {children}
        </p>
      );
  }
};

