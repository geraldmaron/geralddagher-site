'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactEditor } from 'slate-react';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image as ImageIcon, 
  Video, 
  Table,
  FileText,
  Minus,
  CheckSquare,
  Smile,
  Link2,
  Hash,
  Calendar,
  MessageSquare,
  Lightbulb,
  AlertCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/utils/z-index';

interface PlusMenuProps {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  onClose: () => void;
  editor: any;
  onBlockInsert?: (blockType: string) => void;
}

interface BlockGroup {
  title: string;
  items: BlockType[];
}

interface BlockType {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  shortcut?: string;
  popular?: boolean;
}

const BLOCK_GROUPS: BlockGroup[] = [
  {
    title: 'Basic Blocks',
    items: [
      { 
        type: 'paragraph', 
        label: 'Text', 
        icon: Type, 
        description: 'Start writing with plain text',
        shortcut: '⌘⏎',
        popular: true
      },
      { 
        type: 'heading-one', 
        label: 'Heading 1', 
        icon: Heading1, 
        description: 'Large section heading',
        shortcut: '/h1',
        popular: true
      },
      { 
        type: 'heading-two', 
        label: 'Heading 2', 
        icon: Heading2, 
        description: 'Medium section heading',
        shortcut: '/h2'
      },
      { 
        type: 'heading-three', 
        label: 'Heading 3', 
        icon: Heading3, 
        description: 'Small section heading',
        shortcut: '/h3'
      }
    ]
  },
  {
    title: 'Lists & Organization',
    items: [
      { 
        type: 'bulleted-list', 
        label: 'Bullet List', 
        icon: List, 
        description: 'Create a simple bulleted list',
        shortcut: '/ul',
        popular: true
      },
      { 
        type: 'numbered-list', 
        label: 'Numbered List', 
        icon: ListOrdered, 
        description: 'Create a list with numbering',
        shortcut: '/ol'
      },
      { 
        type: 'todo-list', 
        label: 'To-do List', 
        icon: CheckSquare, 
        description: 'Track tasks with checkboxes',
        shortcut: '/todo'
      }
    ]
  },
  {
    title: 'Content Blocks',
    items: [
      { 
        type: 'block-quote', 
        label: 'Quote', 
        icon: Quote, 
        description: 'Capture a quote or callout',
        shortcut: '/quote'
      },
      { 
        type: 'code-block', 
        label: 'Code Block', 
        icon: Code, 
        description: 'Insert a code snippet with syntax highlighting',
        shortcut: '/code',
        popular: true
      },
    ]
  },
  {
    title: 'Media & Embeds',
    items: [
      { 
        type: 'image', 
        label: 'Image', 
        icon: ImageIcon, 
        description: 'Upload or embed an image',
        shortcut: '/image',
        popular: true
      },
      { 
        type: 'video', 
        label: 'Video', 
        icon: Video, 
        description: 'Upload or embed a video',
        shortcut: '/video'
      },
      { 
        type: 'file', 
        label: 'File', 
        icon: FileText, 
        description: 'Upload a file attachment',
        shortcut: '/file'
      }
    ]
  },
  {
    title: 'Advanced',
    items: [
      { 
        type: 'table', 
        label: 'Table', 
        icon: Table, 
        description: 'Insert a table for structured data',
        shortcut: '/table'
      },
      { 
        type: 'divider', 
        label: 'Divider', 
        icon: Minus, 
        description: 'Add a horizontal line to separate content',
        shortcut: '---'
      }
    ]
  }
];

export const PlusMenu = ({ isVisible, position, onClose, editor, onBlockInsert }: PlusMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPopular, setShowPopular] = useState(true);

  const allItems = BLOCK_GROUPS.flatMap(group => group.items);
  const popularItems = allItems.filter(item => item.popular);
  const displayItems = showPopular ? popularItems : allItems;

  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % displayItems.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleBlockInsert(displayItems[selectedIndex].type);
          break;
        case 'Tab':
          event.preventDefault();
          setShowPopular(!showPopular);
          setSelectedIndex(0);
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, selectedIndex, onClose, displayItems, showPopular]);

  const handleBlockInsert = (blockType: string) => {
    try {
      if (onBlockInsert) {
        onBlockInsert(blockType);
      }
      
      onClose();
      
      requestAnimationFrame(() => {
        ReactEditor.focus(editor);
      });
    } catch (error) {
      onClose();
      requestAnimationFrame(() => {
        ReactEditor.focus(editor);
      });
    }
  };

  if (!isVisible || !position) return null;

  return createPortal(
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden min-w-[360px] max-w-[400px]"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: zIndex.plusMenu,
        maxHeight: '500px'
      }}
      role="dialog"
      aria-label="Insert block menu"
    >
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Insert Block
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowPopular(!showPopular);
                setSelectedIndex(0);
              }}
              className={cn(
                'px-2 py-1 text-xs rounded-md transition-all duration-200',
                showPopular
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              {showPopular ? 'Popular' : 'All'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {showPopular ? (
          <div className="p-2">
            <div className="space-y-1">
              {popularItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleBlockInsert(item.type);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-150',
                      'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                      'border-none bg-transparent cursor-pointer group',
                      'focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20',
                      selectedIndex === index 
                        ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' 
                        : ''
                    )}
                  >
                    <div className={cn(
                      'flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
                      selectedIndex === index
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {item.label}
                        </span>
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        {item.description}
                      </div>
                    </div>
                        {item.shortcut && (
                          <div className="text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                            {item.shortcut}
                          </div>
                        )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-2">
            {BLOCK_GROUPS.map((group, groupIndex) => (
              <div key={group.title} className={groupIndex > 0 ? 'mt-4' : ''}>
                <div className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const globalIndex = allItems.indexOf(item);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBlockInsert(item.type);
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-all duration-150',
                          'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                          'border-none bg-transparent cursor-pointer group',
                          'focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20',
                          selectedIndex === globalIndex
                            ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' 
                            : ''
                        )}
                      >
                        <div className={cn(
                          'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-colors',
                          selectedIndex === globalIndex
                            ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700'
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {item.label}
                            </span>
                            {item.popular && <Star className="w-3 h-3 text-amber-500 fill-current" />}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                            {item.description}
                          </div>
                        </div>
                        {item.shortcut && (
                          <div className="text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                            {item.shortcut}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>
            {showPopular ? `${popularItems.length} popular blocks` : `${allItems.length} blocks available`}
          </span>
          <span>
            Tab to switch • ↑↓ • Enter • Esc
          </span>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};