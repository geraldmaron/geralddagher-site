import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Editor, Transforms, Element as SlateElement, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/core/Button';
import { CustomElement } from '@/lib/types/editor';
import {
  Bold, Italic, Underline, Strikethrough, Code, Link, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Type, Minus, Undo, Redo, MoreHorizontal, Highlighter,
  Hash, Smile, Image, Video, Table, FileText,
  ChevronDown, Sparkles, Palette, Eye, Zap, Check, X,
  Subscript, Superscript, RemoveFormatting, LayoutGrid,
  Columns, Rows, Indent, Outdent, ListChecks, ListCollapse,
  Maximize2, Minimize2, Download, Copy, Clipboard, ChevronsRight, ChevronsLeft,
  PanelLeft, PanelRight, SplitSquareHorizontal, Search, Replace, Settings2,
  BookOpen, Bookmark, Star, Flag, Bell, Lock, Unlock, Eye as EyeIcon, EyeOff,
  Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Separator from '@radix-ui/react-separator';
import {
  isInTable,
  insertTable,
  addTableRow,
  removeTableRow,
  addTableColumn,
  removeTableColumn,
  deleteTable
} from '@/lib/editor/tableUtils';
import {
  isListItem,
  indentListItem,
  outdentListItem
} from '@/lib/editor/listUtils';

interface FormattingRibbonProps {
  editor: any;
  className?: string;
  selectedText?: string;
  contextualMode?: 'text' | 'heading' | 'list' | 'media' | 'table';
}

interface ToolGroup {
  id: string;
  label: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  tools: Tool[];
  badge?: string;
}

interface Tool {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  badge?: string;
}

export const FormattingRibbon: React.FC<FormattingRibbonProps> = ({
  editor,
  className,
  selectedText,
  contextualMode = 'text',
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['essential']));
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const isMarkActive = useCallback((format: string) => {
    try {
      const marks = Editor.marks(editor);
      return marks ? marks[format as keyof typeof marks] === true : false;
    } catch (error) {
      return false;
    }
  }, [editor]);

  const toggleMark = useCallback((format: string) => {
    try {
      const isActive = isMarkActive(format);
      if (isActive) {
        Editor.removeMark(editor, format);
      } else {
        Editor.addMark(editor, format, true);
      }
    } catch (error) {
      try {
        Editor.addMark(editor, format, true);
      } catch (addError) {
        void addError;
      }
    }
  }, [editor, isMarkActive]);

  const isBlockActive = useCallback((format: string) => {
    try {
      const { selection } = editor;
      if (!selection) return false;

      const [match] = Array.from(
        Editor.nodes(editor, {
          at: Editor.unhangRange(editor, selection),
          match: (n) =>
            !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
        })
      );

      return !!match;
    } catch (error) {
      return false;
    }
  }, [editor]);

  const toggleBlock = useCallback((format: string) => {
    const { selection } = editor;
    if (!selection) return;
    
    const isActive = isBlockActive(format);
    const isList = ['bulleted-list', 'numbered-list', 'todo-list'].includes(format);

    try {
      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          ['bulleted-list', 'numbered-list', 'todo-list'].includes(n.type),
        split: true,
      });

      let newProperties: Partial<CustomElement>;
      if (isActive) {
        newProperties = { type: 'paragraph' };
      } else if (isList) {
        newProperties = format === 'todo-list' ? { type: 'todo-item', checked: false } : { type: 'list-item' };
      } else {
        newProperties = { type: format as CustomElement['type'] };
      }

      Transforms.setNodes<CustomElement>(editor, newProperties);

      if (!isActive && isList) {
        const block: CustomElement = { type: format as CustomElement['type'], children: [] };
        Transforms.wrapNodes(editor, block);
      }

      try {
        ReactEditor.focus(editor);
      } catch (focusError) {
        void focusError;
      }
    } catch (error) {
      try {
        ReactEditor.focus(editor);
      } catch (focusError) {
        void focusError;
      }
    }
  }, [editor, isBlockActive]);

  const isAlignActive = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    try {
      const { selection } = editor;
      if (!selection) return false;

      const [match] = Array.from(
        Editor.nodes(editor, {
          at: Editor.unhangRange(editor, selection),
          match: (n) =>
            !Editor.isEditor(n) && SlateElement.isElement(n) && n.align === alignment,
        })
      );

      return !!match;
    } catch (error) {
      return false;
    }
  }, [editor]);

  const toggleAlign = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    const isActive = isAlignActive(alignment);
    
    Transforms.setNodes(
      editor,
      { align: isActive ? undefined : alignment } as any,
      { match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) }
    );
  }, [editor, isAlignActive]);

  const insertLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (!url) return;

    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    
    const link: CustomElement = {
      type: 'link',
      url,
      children: isCollapsed ? [{ text: url }] : [],
    };

    if (isCollapsed) {
      Transforms.insertNodes(editor, link);
    } else {
      Transforms.wrapNodes(editor, link, { split: true });
      Transforms.collapse(editor, { edge: 'end' });
    }
  }, [editor]);

  const insertElement = useCallback((type: string) => {
    switch (type) {
      case 'divider': {
        const divider: CustomElement = { type: 'divider', children: [{ text: '' }] };
        Transforms.insertNodes(editor, divider);
        break;
      }
      case 'image': {
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const placeholderImage: CustomElement = {
              type: 'image',
              url: URL.createObjectURL(file),
              alt: file.name,
              children: [{ text: '' }],
            };
            Transforms.insertNodes(editor, placeholderImage);
            
            try {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('fileName', file.name);
              formData.append('bucketContext', 'post-content');
              formData.append('makePublic', 'true');
              
              const response = await fetch('/api/storage/upload', {
                method: 'POST',
                body: formData,
              });
              
              if (response.ok) {
                const data = await response.json();
                const [match] = Array.from(
                  Editor.nodes(editor, {
                    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'image' && n.url === URL.createObjectURL(file),
                    at: [],
                  })
                );
                
                if (match) {
                  const [, path] = match;
                  Transforms.setNodes(
                    editor,
                    { url: data.url },
                    { at: path }
                  );
                }
              }
            } catch (error) {
              void error;
            }
          }
        };
        imageInput.click();
        break;
      }
      case 'video': {
        const videoInput = document.createElement('input');
        videoInput.type = 'file';
        videoInput.accept = 'video/*';
        videoInput.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const placeholderVideo: CustomElement = {
              type: 'video',
              url: URL.createObjectURL(file),
              children: [{ text: '' }],
            };
            Transforms.insertNodes(editor, placeholderVideo);
            
            try {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('fileName', file.name);
              formData.append('bucketContext', 'media-files');
              formData.append('makePublic', 'true');
              
              const response = await fetch('/api/storage/upload', {
                method: 'POST',
                body: formData,
              });
              
              if (response.ok) {
                const data = await response.json();
                const [match] = Array.from(
                  Editor.nodes(editor, {
                    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'video' && n.url === URL.createObjectURL(file),
                    at: [],
                  })
                );
                
                if (match) {
                  const [, path] = match;
                  Transforms.setNodes(
                    editor,
                    { url: data.url },
                    { at: path }
                  );
                }
              }
            } catch (error) {
              void error;
            }
          }
        };
        videoInput.click();
        break;
      }
      case 'table': {
        insertTable(editor, 2, 3);
        break;
      }
      case 'callout':
        Transforms.setNodes(editor, { type: 'callout' } as Partial<CustomElement>);
        break;
      default:
        return;
    }
  }, [editor]);

  const clearFormatting = useCallback(() => {
    const { selection } = editor;
    if (!selection) return;

    const marks = Editor.marks(editor) || {};
    Object.keys(marks).forEach(mark => {
      Editor.removeMark(editor, mark);
    });

    Transforms.setNodes(editor, { type: 'paragraph' } as Partial<CustomElement>);
  }, [editor]);

  useEffect(() => {
    if (selectedText && selectedText.trim().length > 10) {
      const suggestions = [
        'Make it more concise',
        'Add emphasis',
        'Convert to list',
        'Add examples'
      ];
      setAiSuggestions(suggestions);
    } else {
      setAiSuggestions([]);
    }
  }, [selectedText]);

  const toolGroups: ToolGroup[] = useMemo(() => [
    {
      id: 'history',
      label: 'History',
      priority: 'critical',
      tools: [
        {
          id: 'undo',
          icon: Undo,
          label: 'Undo',
          shortcut: '⌘Z',
          action: () => {
            if (editor.history && editor.history.undos && editor.history.undos.length > 0) {
              editor.undo();
            }
          },
          disabled: !(editor.history && editor.history.undos && editor.history.undos.length > 0)
        },
        {
          id: 'redo',
          icon: Redo,
          label: 'Redo',
          shortcut: '⌘⇧Z',
          action: () => {
            if (editor.history && editor.history.redos && editor.history.redos.length > 0) {
              editor.redo();
            }
          },
          disabled: !(editor.history && editor.history.redos && editor.history.redos.length > 0)
        }
      ]
    },
    {
      id: 'text-formatting',
      label: 'Text Formatting',
      priority: 'critical',
      tools: [
        {
          id: 'bold',
          icon: Bold,
          label: 'Bold',
          shortcut: '⌘B',
          action: () => toggleMark('bold'),
          isActive: isMarkActive('bold'),
          variant: 'primary'
        },
        {
          id: 'italic',
          icon: Italic,
          label: 'Italic',
          shortcut: '⌘I',
          action: () => toggleMark('italic'),
          isActive: isMarkActive('italic')
        },
        {
          id: 'underline',
          icon: Underline,
          label: 'Underline',
          shortcut: '⌘U',
          action: () => toggleMark('underline'),
          isActive: isMarkActive('underline')
        },
        {
          id: 'strikethrough',
          icon: Strikethrough,
          label: 'Strikethrough',
          action: () => toggleMark('strikethrough'),
          isActive: isMarkActive('strikethrough')
        }
      ]
    },
    {
      id: 'headings',
      label: 'Headings',
      priority: 'high',
      tools: [
        {
          id: 'headings-dropdown',
          icon: Type,
          label: 'Headings',
          shortcut: '⌘⌥1-6',
          action: () => {},
          isActive: isBlockActive('heading-one') || isBlockActive('heading-two') || isBlockActive('heading-three') || isBlockActive('heading-four') || isBlockActive('heading-five') || isBlockActive('heading-six'),
          variant: 'primary'
        }
      ]
    },
    {
      id: 'advanced-text',
      label: 'Advanced Text',
      priority: 'high',
      tools: [
        {
          id: 'code',
          icon: Code,
          label: 'Inline Code',
          shortcut: '⌘E',
          action: () => toggleMark('code'),
          isActive: isMarkActive('code')
        },
        {
          id: 'highlight',
          icon: Highlighter,
          label: 'Highlight',
          action: () => toggleMark('highlight'),
          isActive: isMarkActive('highlight'),
          variant: 'warning'
        },
        {
          id: 'link',
          icon: Link,
          label: 'Link',
          shortcut: '⌘K',
          action: insertLink,
          variant: 'accent'
        },
        {
          id: 'clear-formatting',
          icon: RemoveFormatting,
          label: 'Clear Formatting',
          action: clearFormatting,
          variant: 'danger'
        }
      ]
    },
    {
      id: 'lists',
      label: 'Lists',
      priority: 'high',
      tools: [
        {
          id: 'bullet-list',
          icon: List,
          label: 'Bullet List',
          shortcut: '⌘⇧8',
          action: () => toggleBlock('bulleted-list'),
          isActive: isBlockActive('bulleted-list')
        },
        {
          id: 'numbered-list',
          icon: ListOrdered,
          label: 'Numbered List',
          shortcut: '⌘⇧7',
          action: () => toggleBlock('numbered-list'),
          isActive: isBlockActive('numbered-list')
        },
        {
          id: 'todo-list',
          icon: ListChecks,
          label: 'Todo List',
          action: () => toggleBlock('todo-list'),
          isActive: isBlockActive('todo-list'),
          variant: 'success'
        },
        {
          id: 'indent-list',
          icon: Indent,
          label: 'Increase Indent',
          shortcut: 'Tab',
          action: () => indentListItem(editor),
          disabled: !isListItem(editor)
        },
        {
          id: 'outdent-list',
          icon: Outdent,
          label: 'Decrease Indent',
          shortcut: '⇧Tab',
          action: () => outdentListItem(editor),
          disabled: !isListItem(editor)
        }
      ]
    },
    {
      id: 'alignment',
      label: 'Alignment',
      priority: 'medium',
      tools: [
        {
          id: 'align-left',
          icon: AlignLeft,
          label: 'Align Left',
          action: () => toggleAlign('left'),
          isActive: isAlignActive('left')
        },
        {
          id: 'align-center',
          icon: AlignCenter,
          label: 'Center',
          action: () => toggleAlign('center'),
          isActive: isAlignActive('center')
        },
        {
          id: 'align-right',
          icon: AlignRight,
          label: 'Align Right',
          action: () => toggleAlign('right'),
          isActive: isAlignActive('right')
        },
        {
          id: 'align-justify',
          icon: AlignJustify,
          label: 'Justify',
          action: () => toggleAlign('justify'),
          isActive: isAlignActive('justify')
        }
      ]
    },
    {
      id: 'blocks',
      label: 'Blocks',
      priority: 'medium',
      tools: [
        {
          id: 'quote',
          icon: Quote,
          label: 'Quote',
          shortcut: '⌘⇧.',
          action: () => toggleBlock('block-quote'),
          isActive: isBlockActive('block-quote')
        },
        {
          id: 'code-block',
          icon: Code,
          label: 'Code Block',
          shortcut: '```',
          action: () => toggleBlock('code-block'),
          isActive: isBlockActive('code-block')
        },
        {
          id: 'callout',
          icon: Sparkles,
          label: 'Callout',
          action: () => insertElement('callout'),
          variant: 'accent'
        },
        {
          id: 'divider',
          icon: Minus,
          label: 'Divider',
          action: () => insertElement('divider')
        }
      ]
    },
    {
      id: 'media',
      label: 'Media & Tables',
      priority: 'medium',
      badge: isInTable(editor) ? 'In Table' : 'Insert',
      tools: isInTable(editor) ? [
        {
          id: 'table-add-row-above',
          icon: ArrowUp,
          label: 'Insert Row Above',
          action: () => addTableRow(editor, 'above'),
          variant: 'primary'
        },
        {
          id: 'table-add-row-below',
          icon: ArrowDown,
          label: 'Insert Row Below',
          action: () => addTableRow(editor, 'below'),
          variant: 'primary'
        },
        {
          id: 'table-remove-row',
          icon: Minus,
          label: 'Remove Row',
          action: () => removeTableRow(editor),
          variant: 'danger'
        },
        {
          id: 'table-add-col-left',
          icon: ArrowLeft,
          label: 'Insert Column Left',
          action: () => addTableColumn(editor, 'left'),
          variant: 'primary'
        },
        {
          id: 'table-add-col-right',
          icon: ArrowRight,
          label: 'Insert Column Right',
          action: () => addTableColumn(editor, 'right'),
          variant: 'primary'
        },
        {
          id: 'table-remove-col',
          icon: Columns,
          label: 'Remove Column',
          action: () => removeTableColumn(editor),
          variant: 'danger'
        },
        {
          id: 'table-delete',
          icon: Trash2,
          label: 'Delete Table',
          action: () => deleteTable(editor),
          variant: 'danger'
        }
      ] : [
        {
          id: 'image',
          icon: Image,
          label: 'Image',
          action: () => insertElement('image'),
          variant: 'accent'
        },
        {
          id: 'video',
          icon: Video,
          label: 'Video',
          action: () => insertElement('video')
        },
        {
          id: 'table',
          icon: Table,
          label: 'Table',
          action: () => insertElement('table')
        }
      ]
    },
    {
      id: 'typography',
      label: 'Typography',
      priority: 'low',
      tools: [
        {
          id: 'superscript',
          icon: Superscript,
          label: 'Superscript',
          action: () => toggleMark('superscript'),
          isActive: isMarkActive('superscript')
        },
        {
          id: 'subscript',
          icon: Subscript,
          label: 'Subscript',
          action: () => toggleMark('subscript'),
          isActive: isMarkActive('subscript')
        }
      ]
    }
  ], [
    editor, 
    toggleMark, 
    toggleBlock, 
    toggleAlign,
    insertLink,
    insertElement,
    clearFormatting,
    isMarkActive, 
    isBlockActive, 
    isAlignActive
  ]);

  const getVariantClasses = (tool: Tool, isActive: boolean) => {
    const baseClasses = "h-9 w-9 p-0 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-1";
    
    if (isActive) {
      return cn(
        baseClasses,
        tool.variant === 'primary' ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600 focus:ring-blue-300' :
        tool.variant === 'accent' ? 'bg-purple-500 text-white shadow-md hover:bg-purple-600 focus:ring-purple-300' :
        tool.variant === 'success' ? 'bg-green-500 text-white shadow-md hover:bg-green-600 focus:ring-green-300' :
        tool.variant === 'warning' ? 'bg-yellow-500 text-white shadow-md hover:bg-yellow-600 focus:ring-yellow-300' :
        tool.variant === 'danger' ? 'bg-red-500 text-white shadow-md hover:bg-red-600 focus:ring-red-300' :
        'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-md hover:bg-neutral-700 dark:hover:bg-neutral-300 focus:ring-neutral-300'
      );
    }

    return cn(
      baseClasses,
      tool.disabled ? 'opacity-40 cursor-not-allowed' :
      tool.variant === 'primary' ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 focus:ring-blue-300' :
      tool.variant === 'accent' ? 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 focus:ring-purple-300' :
      tool.variant === 'success' ? 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 focus:ring-green-300' :
      tool.variant === 'warning' ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 focus:ring-yellow-300' :
      tool.variant === 'danger' ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 focus:ring-red-300' :
      'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:ring-neutral-300'
    );
  };

  const criticalTools = toolGroups.filter(group => group.priority === 'critical');
  const highPriorityTools = toolGroups.filter(group => group.priority === 'high');
  const otherTools = toolGroups.filter(group => ['medium', 'low'].includes(group.priority));

  const getSelectedText = useCallback(() => {
    const { selection } = editor;
    if (!selection || Range.isCollapsed(selection)) return '';
    return Editor.string(editor, selection);
  }, [editor]);

  const handleAIInsert = useCallback((text: string) => {
    Transforms.insertText(editor, text);
  }, [editor]);

  const handleAIReplace = useCallback((text: string) => {
    const { selection } = editor;
    if (selection && !Range.isCollapsed(selection)) {
      Transforms.delete(editor, { at: selection });
      Transforms.insertText(editor, text);
    }
  }, [editor]);

  return (
    <Tooltip.Provider>
      <div
        className={cn(
          'flex flex-col bg-white/98 dark:bg-neutral-900/98 backdrop-blur-sm',
          'border-b border-neutral-200 dark:border-neutral-700',
          'transition-all duration-300 ease-out',
          className
        )}
      >
        <AnimatePresence>
          {aiSuggestions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span className="text-purple-700 dark:text-purple-300 font-medium">AI Suggestions:</span>
                <div className="flex flex-wrap gap-1">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setShowAIModal(true)}
                      className="px-2 py-1 text-xs bg-white dark:bg-neutral-800 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowAIModal(true)}
                  className="ml-auto px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors"
                >
                  Open AI Assistant
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {criticalTools.map((group, groupIndex) => (
              <React.Fragment key={group.id}>
                <div className="flex items-center gap-1.5">
                  {group.tools.map((tool) => {
                    const IconComponent = tool.icon;
                    const isActive = tool.isActive || false;
                    
                    return (
                      <Tooltip.Root key={tool.id}>
                        <Tooltip.Trigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              if (!tool.disabled) tool.action();
                            }}
                            disabled={tool.disabled}
                            className={getVariantClasses(tool, isActive)}
                            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded shadow-lg z-50"
                            sideOffset={5}
                          >
                            {tool.label}
                            {tool.shortcut && (
                              <span className="ml-1 text-neutral-400 dark:text-neutral-500">
                                {tool.shortcut}
                              </span>
                            )}
                            <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    );
                  })}
                </div>
                {groupIndex < criticalTools.length - 1 && (
                  <Separator.Root className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1.5" />
                )}
              </React.Fragment>
            ))}

            <Separator.Root className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1.5" />

            {!isCompactMode && highPriorityTools.map((group, groupIndex) => (
              <React.Fragment key={group.id}>
                <div className="flex items-center gap-1.5">
                  {group.tools.map((tool) => {
                    const IconComponent = tool.icon;
                    const isActive = tool.isActive || false;

                    if (tool.id === 'headings-dropdown') {
                      return (
                        <DropdownMenu.Root key={tool.id}>
                          <Tooltip.Root>
                            <DropdownMenu.Trigger asChild>
                              <Tooltip.Trigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={getVariantClasses(tool, isActive)}
                                  title="Headings"
                                >
                                  <IconComponent className="h-4 w-4" />
                                  <ChevronDown className="h-3 w-3 ml-0.5" />
                                </Button>
                              </Tooltip.Trigger>
                            </DropdownMenu.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded shadow-lg z-50"
                                sideOffset={5}
                              >
                                Headings (⌘⌥1-6)
                                <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              align="start"
                              className="z-50 min-w-[180px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xl animate-in fade-in-50 slide-in-from-top-2"
                              sideOffset={8}
                            >
                              <div className="p-2 space-y-1">
                                {[
                                  { id: 'heading-one', label: 'Heading 1', Icon: Heading1, shortcut: '⌘⌥1', size: 'text-xl' },
                                  { id: 'heading-two', label: 'Heading 2', Icon: Heading2, shortcut: '⌘⌥2', size: 'text-lg' },
                                  { id: 'heading-three', label: 'Heading 3', Icon: Heading3, shortcut: '⌘⌥3', size: 'text-base' },
                                  { id: 'heading-four', label: 'Heading 4', Icon: Heading4, shortcut: '⌘⌥4', size: 'text-sm' },
                                  { id: 'heading-five', label: 'Heading 5', Icon: Heading5, shortcut: '⌘⌥5', size: 'text-sm' },
                                  { id: 'heading-six', label: 'Heading 6', Icon: Heading6, shortcut: '⌘⌥6', size: 'text-xs' },
                                ].map(({ id, label, Icon, shortcut, size }) => (
                                  <button
                                    key={id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      toggleBlock(id);
                                    }}
                                    className={cn(
                                      'w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors',
                                      isBlockActive(id) && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    )}
                                  >
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    <span className={cn('font-bold', size)}>{label}</span>
                                    <span className="ml-auto text-xs text-neutral-400">{shortcut}</span>
                                  </button>
                                ))}
                              </div>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      );
                    }

                    return (
                      <Tooltip.Root key={tool.id}>
                        <Tooltip.Trigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              if (!tool.disabled) tool.action();
                            }}
                            disabled={tool.disabled}
                            className={getVariantClasses(tool, isActive)}
                            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded shadow-lg z-50"
                            sideOffset={5}
                          >
                            {tool.label}
                            {tool.shortcut && (
                              <span className="ml-1 text-neutral-400 dark:text-neutral-500">
                                {tool.shortcut}
                              </span>
                            )}
                            <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    );
                  })}
                </div>
                {groupIndex < highPriorityTools.length - 1 && (
                  <Separator.Root className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1.5" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-3">
            <Separator.Root className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-2" />

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsCompactMode(!isCompactMode);
                  }}
                  className="h-9 w-9 p-0 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  title={isCompactMode ? "Expand Toolbar" : "Compact Toolbar"}
                >
                  {isCompactMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded shadow-lg z-50"
                  sideOffset={5}
                >
                  {isCompactMode ? "Expand Toolbar" : "Compact Toolbar"}
                  <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 focus:ring-2 focus:ring-neutral-300"
                  title="More Tools"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-50 min-w-[280px] rounded-xl border bg-white dark:bg-neutral-900 p-2 shadow-2xl animate-in fade-in-50 slide-in-from-top-2"
                  sideOffset={8}
                >
                  {otherTools.map((group) => (
                    <div key={group.id} className="mb-3 last:mb-0">
                      <div className="px-2 py-1.5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          {group.label}
                        </span>
                        {group.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                            {group.badge}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-1 p-1">
                        {group.tools.map((tool) => {
                          const IconComponent = tool.icon;
                          const isActive = tool.isActive || false;
                          
                          return (
                            <Tooltip.Root key={tool.id}>
                              <Tooltip.Trigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    if (!tool.disabled) tool.action();
                                  }}
                                  disabled={tool.disabled}
                                  className={getVariantClasses(tool, isActive)}
                                  title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                                >
                                  <IconComponent className="h-4 w-4" />
                                </Button>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  className="px-2 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded shadow-lg z-50"
                                  sideOffset={5}
                                >
                                  {tool.label}
                                  {tool.shortcut && (
                                    <span className="ml-1 text-neutral-400 dark:text-neutral-500">
                                      {tool.shortcut}
                                    </span>
                                  )}
                                  <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          );
                        })}
                      </div>
                      <Separator.Root className="h-px bg-neutral-200 dark:bg-neutral-700 mt-2" />
                    </div>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
};
