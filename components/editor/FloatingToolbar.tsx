import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor, Transforms, Range } from 'slate';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/utils/z-index';
import { Button } from '@/components/core/Button';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  MoreVertical,
  Copy,
  Scissors,
  ClipboardPaste,
  Trash2,
  ChevronDown,
  Sparkles,
  Type,
  Palette,
  MoreHorizontal,
  Check,
  X,
  RemoveFormatting,
  Subscript,
  Superscript,
  ListChecks,
  Hash,
  Minus,
  FileText,
  BookOpen
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import * as Separator from '@radix-ui/react-separator';

interface ToolbarAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  active?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  group?: 'text' | 'block' | 'style' | 'utility';
}

interface FloatingToolbarProps {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  actions: ToolbarAction[];
  onAction: (actionId: string) => void;
  onClose: () => void;
  editor?: any;
}

interface ToolbarTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  isVisible,
  position,
  actions,
  onAction,
  onClose,
  editor,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('text');
  const [showMore, setShowMore] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const getSelectedText = useCallback(() => {
    if (!editor) return '';
    const { selection } = editor;
    if (!selection || Range.isCollapsed(selection)) return '';
    return Editor.string(editor, selection);
  }, [editor]);

  const handleAIInsert = useCallback((text: string) => {
    if (!editor) return;
    Transforms.insertText(editor, text);
  }, [editor]);

  const handleAIReplace = useCallback((text: string) => {
    if (!editor) return;
    const { selection } = editor;
    if (selection && !Range.isCollapsed(selection)) {
      Transforms.delete(editor, { at: selection });
      Transforms.insertText(editor, text);
    }
  }, [editor]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible || !ref.current) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-slate-editor="true"]')) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  useEffect(() => {
    if (!isVisible) {
      setShowAIModal(false);
      setShowMore(false);
      setActiveTab('text');
    }
  }, [isVisible]);

  const handleActionClick = useCallback((actionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    onAction(actionId);
  }, [onAction]);

  const textActions: ToolbarAction[] = actions.filter(a => ['bold', 'italic', 'underline', 'strikethrough', 'code'].includes(a.id));
  const blockActions: ToolbarAction[] = [
    ...actions.filter(a => ['link', 'highlight'].includes(a.id)),
  ];
  const styleActions: ToolbarAction[] = actions.filter(a => ['superscript', 'subscript'].includes(a.id));

  const utilityActions: ToolbarAction[] = [
    {
      id: 'copy',
      label: 'Copy',
      icon: Copy,
      action: async () => {
        if (editor) {
          const { selection } = editor;
          if (selection && !Range.isCollapsed(selection)) {
            const text = Editor.string(editor, selection);
            try {
              await navigator.clipboard.writeText(text);
            } catch (err) {
              const textarea = document.createElement('textarea');
              textarea.value = text;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
            }
          }
        }
      },
      group: 'utility'
    },
    {
      id: 'cut',
      label: 'Cut',
      icon: Scissors,
      action: async () => {
        if (editor) {
          const { selection } = editor;
          if (selection && !Range.isCollapsed(selection)) {
            const text = Editor.string(editor, selection);
            try {
              await navigator.clipboard.writeText(text);
              Transforms.delete(editor, { at: selection });
            } catch (err) {
              const textarea = document.createElement('textarea');
              textarea.value = text;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('cut');
              document.body.removeChild(textarea);
              Transforms.delete(editor, { at: selection });
            }
          }
        }
      },
      group: 'utility'
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: ClipboardPaste,
      action: async () => {
        if (editor) {
          try {
            const text = await navigator.clipboard.readText();
            Transforms.insertText(editor, text);
          } catch (err) {
            document.execCommand('paste');
          }
        }
      },
      group: 'utility'
    }
  ];

  const tabs: ToolbarTab[] = [
    { id: 'text', label: 'Text', icon: Type },
    { id: 'block', label: 'Block', icon: BookOpen },
    { id: 'style', label: 'Style', icon: Palette },
  ];

  const getActionsByTab = (tab: string): ToolbarAction[] => {
    switch (tab) {
      case 'text':
        return textActions;
      case 'block':
        return blockActions;
      case 'style':
        return styleActions;
      default:
        return [];
    }
  };

  const currentActions = getActionsByTab(activeTab);

  if (!mounted || !isVisible || !position) {
    return null;
  }

  const getVariantClasses = (action: ToolbarAction) => {
    const isActive = action.active || false;
    const baseClasses = "h-8 w-8 p-0 rounded-lg transition-all duration-200";
    
    if (isActive) {
      return cn(
        baseClasses,
        action.variant === 'primary' ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' :
        action.variant === 'accent' ? 'bg-purple-500 text-white shadow-md hover:bg-purple-600' :
        action.variant === 'success' ? 'bg-green-500 text-white shadow-md hover:bg-green-600' :
        action.variant === 'warning' ? 'bg-yellow-500 text-white shadow-md hover:bg-yellow-600' :
        action.variant === 'danger' ? 'bg-red-500 text-white shadow-md hover:bg-red-600' :
        'bg-blue-500 text-white shadow-md hover:bg-blue-600'
      );
    }

    return cn(
      baseClasses,
      'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
    );
  };

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <Tooltip.Provider>
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'fixed bg-white/98 dark:bg-neutral-900/98 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl',
              'z-50 backdrop-blur-md'
            )}
            style={{
              top: position.top,
              left: position.left,
              zIndex: zIndex.inlineToolbar,
              transform: 'translateX(-50%)',
            }}
            data-menu="inline-toolbar"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex items-center border-b border-neutral-200 dark:border-neutral-700">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setActiveTab(tab.id);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
                      'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                      isActive 
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'text-neutral-600 dark:text-neutral-400 border-b-2 border-transparent',
                      index === 0 ? 'rounded-tl-xl' : '',
                      index === tabs.length - 1 ? 'rounded-tr-xl' : ''
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <Separator.Root orientation="vertical" className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowAIModal(true);
                    }}
                    className="flex items-center gap-1.5 px-2 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">AI</span>
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded shadow-lg z-50"
                    sideOffset={5}
                  >
                    AI Writing Assistant
                    <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>

            <div className="flex items-center gap-2 p-3">
              <Dropdown.Root>
                <Dropdown.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    title="Headings"
                  >
                    <Heading1 className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </Dropdown.Trigger>
                <Dropdown.Portal>
                  <Dropdown.Content
                    align="start"
                    className="z-50 min-w-[160px] rounded-xl border bg-white dark:bg-neutral-900 shadow-2xl animate-in fade-in-50 slide-in-from-top-2"
                    sideOffset={8}
                  >
                    <div className="p-2">
                       {[
                         { id: 'heading-one', label: 'Heading 1', Icon: Heading1 },
                         { id: 'heading-two', label: 'Heading 2', Icon: Heading2 },
                         { id: 'heading-three', label: 'Heading 3', Icon: Heading3 },
                         { id: 'heading-four', label: 'Heading 4', Icon: Heading4 },
                         { id: 'heading-five', label: 'Heading 5', Icon: Heading5 },
                         { id: 'heading-six', label: 'Heading 6', Icon: Heading6 },
                       ].map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            try {
                              const { Transforms } = require('slate');
                              Transforms.setNodes(editor, { type: id } as any);
                            } catch (err) {
                              void err;
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </Dropdown.Content>
                </Dropdown.Portal>
              </Dropdown.Root>

              {currentActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Tooltip.Root key={action.id}>
                    <Tooltip.Trigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onMouseDown={(e) => handleActionClick(action.id, e)}
                        disabled={action.disabled}
                        className={getVariantClasses(action)}
                        title={action.label}
                      >
                        <IconComponent className="h-4 w-4" />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded shadow-lg z-50"
                        sideOffset={5}
                      >
                        {action.label}
                        <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                );
              })}

              {currentActions.length > 0 && (
                <Separator.Root orientation="vertical" className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-2" />
              )}

              <Dropdown.Root open={showMore} onOpenChange={setShowMore}>
                <Dropdown.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    title="More Actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </Dropdown.Trigger>
                <Dropdown.Portal>
                  <Dropdown.Content
                    align="end"
                    className="z-50 min-w-[200px] rounded-xl border bg-white dark:bg-neutral-900 shadow-2xl animate-in fade-in-50 slide-in-from-top-2"
                    sideOffset={8}
                  >
                    <div className="p-2">
                      <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Quick Actions
                      </div>
                      <div className="space-y-1">
                        {utilityActions.map((action) => {
                          const IconComponent = action.icon;
                          return (
                            <button
                              key={action.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                action.action();
                                setShowMore(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                              <IconComponent className="h-4 w-4" />
                              <span>{action.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      <Separator.Root className="h-px bg-neutral-200 dark:bg-neutral-700 my-2" />
                      
                      <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Transform
                      </div>
                      <div className="space-y-1">
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (editor) {
                              const { selection } = editor;
                              if (selection && !Range.isCollapsed(selection)) {
                                const text = Editor.string(editor, selection);
                                Transforms.delete(editor, { at: selection });
                                Transforms.insertText(editor, text.toUpperCase());
                              }
                            }
                            setShowMore(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Type className="h-4 w-4" />
                          <span>UPPERCASE</span>
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (editor) {
                              const { selection } = editor;
                              if (selection && !Range.isCollapsed(selection)) {
                                const text = Editor.string(editor, selection);
                                Transforms.delete(editor, { at: selection });
                                Transforms.insertText(editor, text.toLowerCase());
                              }
                            }
                            setShowMore(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Type className="h-4 w-4" />
                          <span>lowercase</span>
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (editor) {
                              const { selection } = editor;
                              if (selection && !Range.isCollapsed(selection)) {
                                const text = Editor.string(editor, selection);
                                const titleCase = text.replace(/\w\S*/g, (txt) =>
                                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                                );
                                Transforms.delete(editor, { at: selection });
                                Transforms.insertText(editor, titleCase);
                              }
                            }
                            setShowMore(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Type className="h-4 w-4" />
                          <span>Title Case</span>
                        </button>
                      </div>
                    </div>
                  </Dropdown.Content>
                </Dropdown.Portal>
              </Dropdown.Root>
            </div>

            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 rounded-b-xl">
              <div className="flex items-center gap-1">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (editor) {
                          const { Transforms, Element: SlateElement } = require('slate');
                          Transforms.setNodes(editor, { type: 'heading-one' } as any);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                    >
                      <Heading1 className="h-3 w-3" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded shadow-lg z-50"
                      sideOffset={5}
                    >
                      Turn into Heading
                      <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (editor) {
                          const { Transforms, Element: SlateElement } = require('slate');
                          Transforms.unwrapNodes(editor, {
                            match: (n: any) =>
                              !Editor.isEditor(n) &&
                              SlateElement.isElement(n) &&
                              ['bulleted-list', 'numbered-list'].includes(n.type),
                            split: true,
                          });
                          Transforms.setNodes(editor, { type: 'list-item' } as any);
                          Transforms.wrapNodes(editor, { type: 'bulleted-list', children: [] } as any);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                    >
                      <List className="h-3 w-3" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded shadow-lg z-50"
                      sideOffset={5}
                    >
                      Turn into List
                      <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (editor) {
                          const { Transforms } = require('slate');
                          Transforms.setNodes(editor, { type: 'block-quote' } as any);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                    >
                      <Quote className="h-3 w-3" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded shadow-lg z-50"
                      sideOffset={5}
                    >
                      Turn into Quote
                      <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>

              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        </Tooltip.Provider>
      )}
    </AnimatePresence>,
    document.body
  );
};
