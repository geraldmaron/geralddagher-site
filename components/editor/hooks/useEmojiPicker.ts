import { useState, useEffect, useCallback } from 'react';
import { Editor as SlateEditor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

interface EmojiPickerState {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  search: string;
}

export const useEmojiPicker = (editor: any) => {
  const [state, setState] = useState<EmojiPickerState>({
    isVisible: false,
    position: null,
    search: '',
  });

  const focusEditor = useCallback(() => {
    requestAnimationFrame(() => {
      try {
        ReactEditor.focus(editor);
      } catch (error) {
        console.warn('Failed to focus editor:', error);
      }
    });
  }, [editor]);

  const selectEmoji = useCallback((emoji: string) => {
    try {
      const { selection } = editor;
      if (selection) {
        const beforeText = SlateEditor.string(editor, {
          anchor: SlateEditor.start(editor, selection.anchor.path),
          focus: selection.anchor,
        });

        if (beforeText.endsWith(':')) {
          Transforms.delete(editor, {
            at: {
              path: selection.anchor.path,
              offset: selection.anchor.offset - 1
            },
            distance: 1 
          });
        }

        Transforms.insertText(editor, emoji);
        
        setState(prev => ({
          ...prev,
          isVisible: false,
          position: null,
          search: '',
        }));

        focusEditor();
      }
    } catch (error) {
      console.error('Error selecting emoji:', error);
      setState(prev => ({ ...prev, isVisible: false }));
      focusEditor();
    }
  }, [editor, focusEditor]);

  const close = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      position: null,
      search: '',
    }));
  }, []);

  const updateSearch = useCallback((search: string) => {
    setState(prev => ({
      ...prev,
      search,
    }));
  }, []);

  useEffect(() => {
    const handleShowEmojiPicker = (event: CustomEvent) => {
      const { editor: eventEditor, position } = event.detail;
      if (eventEditor === editor) {
        setState(prev => ({
          ...prev,
          isVisible: true,
          position,
          search: '',
        }));
      }
    };

    const handleCloseEmojiPicker = () => {
      close();
    };

    document.addEventListener('show-emoji-picker', handleShowEmojiPicker as EventListener);
    document.addEventListener('close-emoji-picker', handleCloseEmojiPicker);

    return () => {
      document.removeEventListener('show-emoji-picker', handleShowEmojiPicker as EventListener);
      document.removeEventListener('close-emoji-picker', handleCloseEmojiPicker);
    };
  }, [editor, close]);

  return {
    ...state,
    selectEmoji,
    close,
    updateSearch,
    focusEditor,
  };
};