'use client';

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { createEditor, Descendant, Editor as SlateEditor, Element as SlateElement, Transforms, Range } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { CustomElement } from '@/lib/types/editor';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/core/Card';
import { LoadingStatus } from '@/components/core/LoadingStatus';
import { SlashCommandMenu } from './SlashCommandMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { EmojiPicker } from './EmojiPicker';
import { FormattingRibbon } from './FormattingRibbon';
import { useEditorState } from './hooks/useEditorState';
import { useSlashCommands } from './hooks/useSlashCommands';
import { useFloatingToolbar } from './hooks/useFloatingToolbar';
import { useEmojiPicker } from './hooks/useEmojiPicker';
import { EditorElement } from './EditorElement';
import { EditorLeaf } from './EditorLeaf';
import { withMarkdownShortcuts, withSlashCommands, withEmojiCommands, withMediaHandling, withVoidElements } from '@/lib/editor/plugins';

interface EditorProps {
  initialContent?: Descendant[];
  onChange?: (content: Descendant[]) => void;
  onSave?: (content: Descendant[]) => Promise<void>;
  onPublish?: (content: Descendant[]) => Promise<void>;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  showTitle?: boolean;
  metadata?: {
    title: string;
    excerpt: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    category?: string;
    tags: string[];
    author?: string;
    coverImage?: string;
    publishedAt?: string;
    writer_sentiment_ids?: string[];
    postId?: string;
  };
  onMetadataChange?: (metadata: Partial<EditorProps['metadata']>) => void;
}

const EMPTY_EDITOR: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export const Editor: React.FC<EditorProps> = ({
  initialContent = EMPTY_EDITOR,
  onChange,
  onSave,
  onPublish,
  className,
  placeholder = "Start writing...",
  readOnly = false,
  autoSave = false,
  autoSaveDelay = 2000,
  showTitle = true,
  metadata = {
    title: '',
    excerpt: '',
    slug: '',
    status: 'draft',
    tags: [],
    writer_sentiment_ids: [],
    postId: undefined,
  },
  onMetadataChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor] = useState(() => {
    const baseEditor = withHistory(withReact(createEditor()));
    const withVoidEditor = withVoidElements(baseEditor);
    const withMediaEditor = withMediaHandling(withVoidEditor);
    const withMarkdownEditor = withMarkdownShortcuts(withMediaEditor);
    const withEmojiEditor = withEmojiCommands(withMarkdownEditor);
    const finalEditor = withSlashCommands(withEmojiEditor);
    return finalEditor;
  });

  const editorState = useEditorState(editor, { autoSave, autoSaveDelay });
  const slashCommands = useSlashCommands(editor);
  const floatingToolbar = useFloatingToolbar(editor);
  const emojiPicker = useEmojiPicker(editor);

  const [stableInitialValue] = useState<Descendant[]>(() => initialContent);

  const lastInitializedContentRef = useRef<string>('');
  const isUpdatingFromPropsRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const contentKey = JSON.stringify(initialContent);

    const shouldUpdate = !hasInitializedRef.current ||
      (contentKey !== lastInitializedContentRef.current && !isUpdatingFromPropsRef.current);

    if (shouldUpdate) {
      hasInitializedRef.current = true;
      lastInitializedContentRef.current = contentKey;
      isUpdatingFromPropsRef.current = true;

      editorState.initializeContent(initialContent);

      const currentContentKey = JSON.stringify(editor.children);
      if (currentContentKey !== contentKey) {
        SlateEditor.withoutNormalizing(editor, () => {
          const length = editor.children.length;
          for (let i = length - 1; i >= 0; i--) {
            Transforms.removeNodes(editor, { at: [i] });
          }

          Transforms.insertNodes(editor, initialContent, { at: [0] });
        });
      }

      isUpdatingFromPropsRef.current = false;
    }
  }, [editor, editorState, initialContent]);

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const savedSelectionRef = useRef<Range | null>(null);

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const openLinkInput = useCallback(() => {
    const selection = editor.selection;
    savedSelectionRef.current = selection ?? null;
    let initial = '';
    try {
      if (selection && !Range.isCollapsed(selection)) {
        const text = SlateEditor.string(editor, selection).trim();
        initial = text;
      }
    } catch {
    }
    setLinkValue(initial);
    setShowLinkInput(true);
  }, [editor]);

  const insertOrWrapLink = useCallback(() => {
    const value = linkValue.trim();
    if (!isValidUrl(value)) {
      return;
    }
    try {
      ReactEditor.focus(editor);
      if (savedSelectionRef.current) {
        Transforms.select(editor, savedSelectionRef.current);
      }
    } catch {
    }
    const link: CustomElement = {
      type: 'link',
      url: value,
      children: savedSelectionRef.current && !Range.isCollapsed(savedSelectionRef.current) ? [] : [{ text: value }],
    };
    if (savedSelectionRef.current && !Range.isCollapsed(savedSelectionRef.current)) {
      Transforms.wrapNodes(editor, link, { split: true });
    } else {
      Transforms.insertNodes(editor, link);
    }
    setShowLinkInput(false);
    setLinkValue('');
    savedSelectionRef.current = null;
  }, [editor, linkValue]);


  const handleContentChange = useCallback((value: Descendant[]) => {
    if (isUpdatingFromPropsRef.current) {
      return;
    }
    editorState.updateContent(value);
    onChange?.(value);
  }, [editorState, onChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (readOnly) return;

    if (slashCommands.isVisible) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          slashCommands.navigateDown();
          break;
        case 'ArrowUp':
          event.preventDefault();
          slashCommands.navigateUp();
          break;
        case 'Enter':
          event.preventDefault();
          if (slashCommands.commands[slashCommands.selectedIndex]) {
            slashCommands.executeCommand(slashCommands.commands[slashCommands.selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          slashCommands.closeMenu();
          break;
      }
      return;
    }

    if (emojiPicker.isVisible) {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          emojiPicker.close();
          break;
      }
      return;
    }

    const { selection } = editor;
    const isCmd = event.metaKey || event.ctrlKey;

    if (isCmd) {
      const toggleMark = (mark: string) => {
        const marks = SlateEditor.marks(editor);
        const isActive = marks ? marks[mark as keyof typeof marks] === true : false;
        if (isActive) {
          SlateEditor.removeMark(editor, mark);
        } else {
          SlateEditor.addMark(editor, mark, true);
        }
      };

      switch (event.key) {
        case 'b':
          event.preventDefault();
          toggleMark('bold');
          return;
        case 'i':
          event.preventDefault();
          toggleMark('italic');
          return;
        case 'u':
          event.preventDefault();
          toggleMark('underline');
          return;
        case 'e':
          event.preventDefault();
          toggleMark('code');
          return;
        case 'h':
          if (event.shiftKey) {
            event.preventDefault();
            toggleMark('highlight');
          }
          return;
        case 'k': {
          event.preventDefault();
          openLinkInput();
          return;
        }
        case ',': {
          if (event.shiftKey) {
            event.preventDefault();
            const marks = SlateEditor.marks(editor);
            if (marks?.superscript) {
              SlateEditor.removeMark(editor, 'superscript');
            }
            toggleMark('subscript');
          }
          return;
        }
        case '.': {
          if (event.shiftKey) {
            event.preventDefault();
            const marks = SlateEditor.marks(editor);
            if (marks?.subscript) {
              SlateEditor.removeMark(editor, 'subscript');
            }
            toggleMark('superscript');
          }
          return;
        }
      }
    }

    if (event.key === 'Tab' && selection) {
      try {
        const [match] = SlateEditor.nodes(editor, {
          match: n => !SlateEditor.isEditor(n) && SlateElement.isElement(n) && n.type === 'list-item',
        });

        if (match) {
          event.preventDefault();
          return;
        }
      } catch (error) {
      }
    }

    if (event.key === 'Enter' && selection) {
      try {
        const [listItemMatch] = SlateEditor.nodes(editor, {
          match: n => !SlateEditor.isEditor(n) && SlateElement.isElement(n) && n.type === 'list-item',
        });

        if (listItemMatch) {
          const [listItem, listItemPath] = listItemMatch;
          const itemText = SlateEditor.string(editor, listItemPath);

          if (!itemText.trim()) {
            event.preventDefault();

            Transforms.unwrapNodes(editor, {
              match: n => !SlateEditor.isEditor(n) && SlateElement.isElement(n) &&
                ['bulleted-list', 'numbered-list'].includes((n as CustomElement).type),
              split: true,
            });

            Transforms.setNodes(editor, { type: 'paragraph' } as Partial<CustomElement>);

            return;
          }
        }
      } catch (error) {
      }
    }

    if (event.key === 'Escape') {
      floatingToolbar.close();
      slashCommands.closeMenu();
      emojiPicker.close();
    }
  }, [readOnly, slashCommands, emojiPicker, floatingToolbar, editor]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (readOnly) return;

    const target = event.target as HTMLElement;
    const isEditorClick = target.closest('[data-slate-editor="true"]');
    const isMenuClick = target.closest('[data-menu]');

    if (!isEditorClick && !isMenuClick) {
      floatingToolbar.close();
      slashCommands.closeMenu();
      emojiPicker.close();
    }
  }, [readOnly, floatingToolbar, slashCommands, emojiPicker]);

  const handleEditorClick = useCallback((event: React.MouseEvent) => {
    if (readOnly) return;

    try {
      ReactEditor.focus(editor);
    } catch (error) {
    }
  }, [readOnly, editor]);

  const renderElement = useCallback((props: any) => (
    <EditorElement {...props} />
  ), []);

  const renderLeaf = useCallback((props: any) => (
    <EditorLeaf {...props} />
  ), []);

  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        editorState.setLoading(true);
        const currentContent = editor.children;
        await onSave(currentContent);
        editorState.setDirty(false);
      } catch (error) {
        editorState.setError(error instanceof Error ? error.message : 'Save failed');
      } finally {
        editorState.setLoading(false);
      }
    }
  }, [onSave, editor, editorState]);

  const handlePublish = useCallback(async () => {
    if (onPublish) {
      try {
        editorState.setLoading(true);
        const currentContent = editor.children;
        await onPublish(currentContent);
        editorState.setDirty(false);
      } catch (error) {
        editorState.setError(error instanceof Error ? error.message : 'Publish failed');
      } finally {
        editorState.setLoading(false);
      }
    }
  }, [onPublish, editor, editorState]);

  return (
    <div className={cn('relative w-full h-full flex flex-col bg-neutral-50 dark:bg-neutral-900', className)} onClick={handleClick}>
      <Card className="w-full flex-1 flex flex-col shadow-lg border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {showTitle ? (
                <input
                  type="text"
                  value={metadata?.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    onMetadataChange?.({
                      title,
                      slug: metadata?.slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled'
                    });
                  }}
                  placeholder="Untitled Post"
                  className="flex-1 text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 bg-transparent border-none outline-none focus:ring-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                />
              ) : (
                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">Editor</h2>
              )}
              {editorState.isDirty && (
                <span className="hidden sm:inline text-xs text-amber-600 dark:text-amber-400 font-medium shrink-0">Unsaved</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={editorState.isLoading || !editorState.isDirty}
                  loading={editorState.isLoading}
                  className="text-xs sm:text-sm"
                >
                  Save
                </Button>
              )}

              {onPublish && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  disabled={editorState.isLoading}
                  loading={editorState.isLoading}
                  className="text-xs sm:text-sm"
                >
                  {metadata?.postId ? 'Update' : 'Publish'}
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 relative flex flex-col overflow-hidden">
            <FormattingRibbon editor={editor} className="border-b border-neutral-200 dark:border-neutral-800" />

            <div className="flex-1 relative overflow-y-auto">
              <Slate
                editor={editor}
                initialValue={stableInitialValue}
                onChange={handleContentChange}
              >
                <div
                  ref={editorRef}
                  className="min-h-full py-6 sm:py-8 px-4 sm:px-8 md:px-12 focus-within:outline-none cursor-text"
                  onClick={handleEditorClick}
                >
                  <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder={placeholder}
                    spellCheck={true}
                    readOnly={readOnly}
                    onKeyDown={handleKeyDown}
                    className="min-h-full prose prose-neutral dark:prose-invert max-w-none focus:outline-none"
                    data-slate-editor="true"
                  />

                  {showLinkInput && (
                    <div className="fixed inset-0 z-[60]" aria-hidden="true" onClick={() => setShowLinkInput(false)} />
                  )}
                  {showLinkInput && (
                    <div
                      role="dialog"
                      aria-modal="true"
                      className="fixed z-[61] top-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl">
                        <div className="p-3 sm:p-4 flex items-center gap-2">
                          <input
                            autoFocus
                            type="url"
                            inputMode="url"
                            value={linkValue}
                            onChange={(e) => setLinkValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') insertOrWrapLink();
                              if (e.key === 'Escape') setShowLinkInput(false);
                            }}
                            placeholder="https://example.com"
                            className="flex-1 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                            aria-label="Link URL"
                          />
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={insertOrWrapLink}
                            disabled={!isValidUrl(linkValue)}
                            className="px-3 py-2 rounded-lg bg-blue-600 text-white disabled:bg-neutral-400"
                            aria-disabled={!isValidUrl(linkValue)}
                          >
                            Add
                          </button>
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setShowLinkInput(false)}
                            className="px-3 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                          >
                            Cancel
                          </button>
                        </div>
                        {!isValidUrl(linkValue) && linkValue && (
                          <div className="px-4 pb-3 text-xs text-red-600 dark:text-red-400">Enter a valid http(s) URL</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </Slate>
            </div>
          </div>

          <FloatingToolbar
            isVisible={floatingToolbar.isVisible}
            position={floatingToolbar.position}
            actions={floatingToolbar.actions}
            onAction={floatingToolbar.executeAction}
            onClose={floatingToolbar.close}
            editor={editor}
          />

          <SlashCommandMenu
            isVisible={slashCommands.isVisible}
            position={slashCommands.position}
            commands={slashCommands.commands}
            selectedIndex={slashCommands.selectedIndex}
            search={slashCommands.search}
            onExecuteCommand={slashCommands.executeCommand}
            onClose={slashCommands.closeMenu}
            onNavigateUp={slashCommands.navigateUp}
            onNavigateDown={slashCommands.navigateDown}
            onSearchChange={slashCommands.updateSearch}
          />

          <EmojiPicker
            isVisible={emojiPicker.isVisible}
            position={emojiPicker.position}
            search={emojiPicker.search}
            onSelectEmoji={emojiPicker.selectEmoji}
            onClose={emojiPicker.close}
            onSearchChange={emojiPicker.updateSearch}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-3 sm:gap-4">
              <span>Words: {editorState.wordCount}</span>
              <span>Characters: {editorState.characterCount}</span>
            </div>

            <div className="flex items-center gap-2">
              {editorState.lastSaved && (
                <span className="text-xs">Saved: {editorState.lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
          </div>

      </Card>

      <AnimatePresence>
        {editorState.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <LoadingStatus
              loading={true}
              message="Saving..."
              variant="spinner"
              size="lg"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editorState.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-2">
              <span>{editorState.error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editorState.clearError()}
                className="h-auto p-1"
              >
                ×
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};