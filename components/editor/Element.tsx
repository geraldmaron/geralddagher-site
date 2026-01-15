import React, { memo, useMemo } from 'react';
import { Element as SlateElement } from 'slate';
import { CustomElement } from '@/lib/types/editor';
import { cn } from '@/lib/utils';

interface ElementProps {
  attributes: any;
  children: React.ReactNode;
  element: CustomElement;
  colWidths?: Record<string, number[]>;
  setColWidths?: (value: React.SetStateAction<Record<string, number[]>>) => void;
}

const Element = memo<ElementProps>(({ 
  attributes, 
  children, 
  element, 
  colWidths, 
  setColWidths 
}) => {
  const elementProps = useMemo(() => ({
    ...attributes,
    className: cn(
      'editor-element',
      `editor-element-${element.type}`,
      element.align && `text-${element.align}`,
      element.id && `element-${element.id}`
    ),
  }), [attributes, element.type, element.align, element.id]);

  const renderElement = useMemo(() => {
    switch (element.type) {
      case 'paragraph':
        return (
          <p {...elementProps}>
            {children}
          </p>
        );

      case 'heading-one':
        return (
          <h1 {...elementProps} className={cn(elementProps.className, 'text-3xl font-bold')}>
            {children}
          </h1>
        );

      case 'heading-two':
        return (
          <h2 {...elementProps} className={cn(elementProps.className, 'text-2xl font-bold')}>
            {children}
          </h2>
        );

      case 'heading-three':
        return (
          <h3 {...elementProps} className={cn(elementProps.className, 'text-xl font-bold')}>
            {children}
          </h3>
        );

      case 'block-quote':
        return (
          <blockquote {...elementProps} className={cn(elementProps.className, 'border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 italic')}>
            {children}
          </blockquote>
        );

      case 'code-block':
        return (
          <pre {...elementProps} className={cn(elementProps.className, 'bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg overflow-x-auto')}>
            <code>{children}</code>
          </pre>
        );

      case 'bulleted-list':
        return (
          <ul {...elementProps} className={cn(elementProps.className, 'list-disc pl-6 space-y-1')}>
            {children}
          </ul>
        );

      case 'numbered-list':
        return (
          <ol {...elementProps} className={cn(elementProps.className, 'list-decimal pl-6 space-y-1')}>
            {children}
          </ol>
        );

      case 'list-item':
        const listDepth = element.depth || 0;
        return (
          <li {...elementProps} style={{ marginLeft: `${listDepth * 1.5}rem` }}>
            {children}
          </li>
        );

      case 'todo-list':
        return (
          <div {...elementProps} className={cn(elementProps.className, 'space-y-2')}>
            {children}
          </div>
        );

      case 'todo-item':
        const todoDepth = element.depth || 0;
        return (
          <div {...elementProps} className={cn(elementProps.className, 'flex items-start gap-2')} style={{ marginLeft: `${todoDepth * 1.5}rem` }}>
            <input
              type="checkbox"
              checked={element.checked || false}
              readOnly
              className="mt-1 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500 dark:bg-neutral-800 dark:checked:bg-blue-600 dark:checked:border-blue-600"
            />
            <div className="flex-1 text-neutral-900 dark:text-neutral-100">
              {children}
            </div>
          </div>
        );

      case 'table':
        return (
          <div {...elementProps} className={cn(elementProps.className, 'overflow-x-auto')}>
            <table className="w-full border-collapse border border-neutral-300 dark:border-neutral-600">
              {children}
            </table>
          </div>
        );

      case 'table-row':
        return (
          <tr {...elementProps}>
            {children}
          </tr>
        );

      case 'table-cell':
        return (
          <td 
            {...elementProps} 
            className={cn(elementProps.className, 'border border-neutral-300 dark:border-neutral-600 p-2')}
            style={{
              ...elementProps.style,
              ...(element.colSpan && { colSpan: element.colSpan }),
              ...(element.rowSpan && { rowSpan: element.rowSpan }),
            }}
          >
            {children}
          </td>
        );

      case 'image':
        return (
          <div {...elementProps} className={cn(elementProps.className, 'my-4')}>
            <img
              src={element.url}
              alt={element.alt || ''}
              className="max-w-full h-auto rounded-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            {element.caption && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                {element.caption}
              </p>
            )}
          </div>
        );

      case 'video':
        return (
          <div {...elementProps} className={cn(elementProps.className, 'my-4')}>
            <video
              src={element.url}
              controls
              className="max-w-full h-auto rounded-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'file':
        return (
          <div {...elementProps} className={cn(elementProps.className, 'my-4 p-4 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800')}>
            <a
              href={element.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>📎</span>
              <span>{children}</span>
            </a>
          </div>
        );

      case 'divider':
        return (
          <div {...elementProps} contentEditable={false} className={cn(elementProps.className, 'my-8')}>
            <hr className="border-0 border-t-2 border-neutral-300 dark:border-neutral-600" />
            {children}
          </div>
        );

      default:
        return (
          <div {...elementProps}>
            {children}
          </div>
        );
    }
  }, [element, elementProps, children]);

  return renderElement;
});

Element.displayName = 'Element';

export default Element;
