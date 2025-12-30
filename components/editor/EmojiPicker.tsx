import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/utils/z-index';

interface EmojiPickerProps {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  search: string;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  onSearchChange: (search: string) => void;
}

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isVisible,
  position,
  search,
  onSelectEmoji,
  onClose,
  onSearchChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible || !ref.current) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  const fuse = new Fuse(EMOJIS, {
    threshold: 0.3,
    includeScore: true,
  });

  const filteredEmojis = search.trim() 
    ? fuse.search(search.trim()).map(result => result.item)
    : EMOJIS.slice(0, 50);

  const handleEmojiClick = useCallback((emoji: string) => {
    onSelectEmoji(emoji);
  }, [onSelectEmoji]);

  if (!mounted || !isVisible || !position) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={cn(
            'fixed bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg',
            'w-80 max-h-80 overflow-y-auto z-50'
          )}
          style={{
            top: position.top,
            left: position.left,
            zIndex: zIndex.emojiPicker,
          }}
          data-menu="emoji-picker"
        >
          <div className="p-2">
            <input
              type="text"
              placeholder="Search emojis..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              autoFocus
            />
            
            <div className="grid grid-cols-8 gap-1 mt-2">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            {filteredEmojis.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No emojis found
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

