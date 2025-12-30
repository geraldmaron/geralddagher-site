import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/utils/z-index';
import { SlashCommand } from '@/lib/editor/plugins';
import * as LucideIcons from 'lucide-react';

interface SlashCommandMenuProps {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  commands: SlashCommand[];
  selectedIndex: number;
  search: string;
  onExecuteCommand: (command: SlashCommand) => void;
  onClose: () => void;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  onSearchChange: (search: string) => void;
}

const iconMap: Record<string, keyof typeof LucideIcons> = {
  'H1': 'Heading1',
  'H2': 'Heading2',
  'H3': 'Heading3',
  'P': 'Type',
  '•': 'List',
  '1.': 'ListOrdered',
  '"': 'Quote',
  '</>': 'Code',
  '⊞': 'Table',
  '🖼️': 'Image',
  '🎥': 'Video',
  '📎': 'FileText',
  '🔗': 'Link',
  '—': 'Minus',
};

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = memo((props) => {
  const {
    isVisible,
    position,
    commands,
    selectedIndex,
    search,
    onExecuteCommand,
    onClose,
    onNavigateUp,
    onNavigateDown,
    onSearchChange,
  } = props;
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
      if (event.key === 'ArrowUp') {
        onNavigateUp();
      }
      if (event.key === 'ArrowDown') {
        onNavigateDown();
      }
      if (event.key === 'Enter') {
        if (commands[selectedIndex]) {
          onExecuteCommand(commands[selectedIndex]);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose, onNavigateUp, onNavigateDown, onExecuteCommand, commands, selectedIndex]);

  const handleCommandClick = useCallback((command: SlashCommand) => {
    onExecuteCommand(command);
  }, [onExecuteCommand]);

  const scrollIntoView = useCallback((index: number) => {
    const item = ref.current?.querySelector(`[data-index="${index}"]`);
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      scrollIntoView(selectedIndex);
    }
  }, [selectedIndex, isVisible, scrollIntoView]);

  const fuse = new Fuse(commands, {
    keys: ['title', 'description', 'keywords', 'group'],
    threshold: 0.3,
    includeScore: true,
  });

  const filteredCommands = search.trim()
    ? fuse.search(search.trim()).map(result => result.item)
    : commands;

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const group = groups[command.group] || [];
    group.push(command);
    groups[command.group] = group;
    return groups;
  }, {} as Record<string, SlashCommand[]>);

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
            zIndex: zIndex.slashMenu,
          }}
          data-menu="slash"
        >
          <div className="p-2">
            {Object.entries(groupedCommands).map(([groupName, groupCommands]) => (
              <div key={groupName} className="mb-2 last:mb-0">
                <div className="px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  {groupName}
                </div>
                {groupCommands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;
                  const IconName = iconMap[command.icon as string];
                  let IconComponent: any = LucideIcons.Type;
                  if (IconName && LucideIcons[IconName] &&
                    (typeof LucideIcons[IconName] === 'function' ||
                     (typeof LucideIcons[IconName] === 'object' && (LucideIcons[IconName] as any).render))) {
                    IconComponent = LucideIcons[IconName];
                  }
                  return (
                    <button
                      key={`${command.id}-${index}`}
                      data-index={globalIndex}
                      onClick={() => handleCommandClick(command)}
                      className={cn(
                        'w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                        isSelected && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      )}
                    >
                      <div className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center',
                        'bg-neutral-100 dark:bg-neutral-800',
                        isSelected && 'bg-blue-100 dark:bg-blue-900/40'
                      )}>
                        {React.isValidElement(<IconComponent className="h-4 w-4" />)
                          ? <IconComponent className="h-4 w-4" />
                          : <LucideIcons.Type className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          'font-medium text-sm truncate',
                          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-900 dark:text-neutral-100'
                        )}>
                          {command.title}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {command.description}
                        </div>
                      </div>
                      {command.shortcut && (
                        <div className="flex-shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
                          {command.shortcut}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            {filteredCommands.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No commands found
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
});