import React, { memo, useMemo } from 'react';
import { CustomText } from '@/lib/types/editor';
import { cn } from '@/lib/utils';

interface LeafProps {
  attributes: any;
  children: React.ReactNode;
  leaf: CustomText;
}

const Leaf = memo<LeafProps>(({ attributes, children, leaf }) => {
  const leafProps = useMemo(() => ({
    ...attributes,
    className: cn(
      'editor-leaf',
      leaf.bold && 'font-bold',
      leaf.italic && 'italic',
      leaf.underline && 'underline',
      leaf.strikethrough && 'line-through',
      leaf.code && 'bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-sm font-mono',
      leaf.superscript && 'align-super text-xs',
      leaf.subscript && 'align-sub text-xs',
      leaf.link && 'text-blue-600 dark:text-blue-400 underline hover:no-underline',
      leaf.color && `text-[${leaf.color}]`,
      leaf.backgroundColor && `bg-[${leaf.backgroundColor}]`
    ),
    style: {
      ...attributes.style,
      ...(leaf.color && { color: leaf.color }),
      ...(leaf.backgroundColor && { backgroundColor: leaf.backgroundColor }),
    },
  }), [attributes, leaf]);

  const renderLeaf = useMemo(() => {
    let element = <span {...leafProps}>{children}</span>;

    if (leaf.link) {
      element = (
        <a
          href={leaf.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
        >
          {element}
        </a>
      );
    }

    if (leaf.emoji) {
      element = <span className="emoji">{element}</span>;
    }

    return element;
  }, [leafProps, children, leaf.link, leaf.emoji]);

  return renderLeaf;
});

Leaf.displayName = 'Leaf';

export default Leaf;
