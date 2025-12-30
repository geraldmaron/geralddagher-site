'use client';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bold, 
  Italic, 
  Link2, 
  Code, 
  Strikethrough, 
  Underline, 
  Highlighter, 
  Type,
  Palette,
  MoreVertical,
  ExternalLink,
  Unlink
} from 'lucide-react';
import Button from '@/components/core/Button';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/utils/z-index';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';

interface InlineToolbarProps {
  isVisible: boolean;
  top: number;
  left: number;
  onFormat: (format: string) => void;
  onLink: (url: string) => void;
}

interface ToolbarButton {
  format: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  color?: string;
  group: 'text' | 'style' | 'link' | 'more';
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { format: 'bold', icon: Bold, label: 'Bold', shortcut: '⌘B', group: 'text' },
  { format: 'italic', icon: Italic, label: 'Italic', shortcut: '⌘I', group: 'text' },
  { format: 'underline', icon: Underline, label: 'Underline', shortcut: '⌘U', group: 'text' },
  { format: 'strikethrough', icon: Strikethrough, label: 'Strikethrough', shortcut: '⌘⇧S', group: 'text' },
  { format: 'code', icon: Code, label: 'Inline Code', shortcut: '⌘E', color: 'text-gray-100', group: 'style' },
  { format: 'highlight', icon: Highlighter, label: 'Highlight', shortcut: '⌘⇧H', color: 'text-yellow-400', group: 'style' },
];

export const InlineToolbar: React.FC<InlineToolbarProps> = ({
  isVisible,
  top,
  left,
  onFormat,
  onLink,
}) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  if (!isVisible) return null;

  const handleLinkSubmit = () => {
    onLink(linkUrl);
    setLinkUrl('');
    setShowLinkInput(false);
    
    requestAnimationFrame(() => {
      const editorElement = document.querySelector('[data-slate-editor="true"]') as HTMLElement;
      if (editorElement) {
        editorElement.focus();
      }
    });
  };

  const handleLinkRemove = () => {
    onLink('');
    setLinkUrl('');
    setShowLinkInput(false);
    
    requestAnimationFrame(() => {
      const editorElement = document.querySelector('[data-slate-editor="true"]') as HTMLElement;
      if (editorElement) {
        editorElement.focus();
      }
    });
  };

  const handleFormat = (format: string) => {
    onFormat(format);
    requestAnimationFrame(() => {
      const editorElement = document.querySelector('[data-slate-editor="true"]') as HTMLElement;
      if (editorElement) {
        editorElement.focus();
      }
    });
  };

  const textButtons = TOOLBAR_BUTTONS.filter(btn => btn.group === 'text');
  const styleButtons = TOOLBAR_BUTTONS.filter(btn => btn.group === 'style');

  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      data-menu="inline-toolbar"
      style={{ 
        position: 'absolute', 
        top: top - 10, 
        left: left,
        zIndex: zIndex.inlineToolbar,
        transform: 'translateX(-50%)'
      }}
      className={cn(
        'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
        'rounded-xl shadow-2xl flex items-center px-2 py-2 gap-1',
        'backdrop-blur-sm'
      )}
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      {textButtons.map((button) => {
        const Icon = button.icon;
        return (
          <Button
            key={button.format}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 border-0 transition-colors rounded-lg"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleFormat(button.format)}
            title={`${button.label} (${button.shortcut})`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />

      {styleButtons.map((button) => {
        const Icon = button.icon;
        return (
          <Button
            key={button.format}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-0 transition-colors rounded-lg",
              button.color || "text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleFormat(button.format)}
            title={`${button.label} (${button.shortcut})`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />

      <Popover.Root open={showLinkInput} onOpenChange={setShowLinkInput}>
        <Popover.Trigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border-0 transition-colors rounded-lg"
            title="Add Link (⌘K)"
            onClick={() => setShowLinkInput(true)}
          >
            <Link2 className="h-4 w-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content 
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-4 flex flex-col gap-3 min-w-[300px] z-[1002] animate-in fade-in-0 zoom-in-95 duration-150"
            sideOffset={8}
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Add Link
              </span>
            </div>
            <input
              type="url"
              placeholder="Paste or type a link..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLinkSubmit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setShowLinkInput(false);
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                
                onClick={handleLinkSubmit}
                disabled={!linkUrl.trim()}
              >
                <ExternalLink className="w-3 h-3 mr-1.5" />
                Apply Link
              </Button>
              <Button
                size="sm"
                className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 border-0 transition-colors rounded-lg"
                onClick={handleLinkRemove}
              >
                <Unlink className="w-3 h-3 mr-1.5" />
                Remove
              </Button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Popover.Root open={showMoreOptions} onOpenChange={setShowMoreOptions}>
        <Popover.Trigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 border-0 transition-colors rounded-lg"
            title="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content 
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-2 z-[1002] animate-in fade-in-0 zoom-in-95 duration-150"
            sideOffset={8}
          >
            <div className="space-y-1">
              <button
                onClick={() => {
                  handleFormat('superscript');
                  setShowMoreOptions(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Type className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-sm text-neutral-900 dark:text-neutral-100">Superscript</span>
                <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">x²</span>
              </button>
              <button
                onClick={() => {
                  handleFormat('subscript');
                  setShowMoreOptions(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Type className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-sm text-neutral-900 dark:text-neutral-100">Subscript</span>
                <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">x₂</span>
              </button>
              <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
              <button
                onClick={() => {
                  handleFormat('clear-formatting');
                  setShowMoreOptions(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Palette className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-sm text-neutral-900 dark:text-neutral-100">Clear Formatting</span>
                <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">⌘\\</span>
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </motion.div>,
    document.body
  );
};