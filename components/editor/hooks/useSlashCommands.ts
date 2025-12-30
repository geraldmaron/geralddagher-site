import { useState, useEffect, useCallback, useMemo } from 'react';
import { Editor as SlateEditor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import { SlashCommand } from '@/lib/editor/plugins';

interface SlashCommandState {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  commands: SlashCommand[];
  selectedIndex: number;
  search: string;
}

export const useSlashCommands = (editor: any) => {
  const [state, setState] = useState<SlashCommandState>({
    isVisible: false,
    position: null,
    commands: [],
    selectedIndex: 0,
    search: '',
  });

  const focusEditor = useCallback(() => {
    requestAnimationFrame(() => {
      try {
        ReactEditor.focus(editor);
      } catch (error) {
        // Ignore focus errors
      }
    });
  }, [editor]);

  const executeCommand = useCallback((command: SlashCommand) => {
    try {
      const { selection } = editor;
      if (selection) {
        const beforeText = SlateEditor.string(editor, {
          anchor: SlateEditor.start(editor, selection.anchor.path),
          focus: selection.anchor,
        });

        if (beforeText.endsWith('/')) {
          Transforms.delete(editor, {
            at: {
              path: selection.anchor.path,
              offset: selection.anchor.offset - 1
            },
            distance: 1 
          });
        }

        command.action(editor);
        
        setState(prev => ({
          ...prev,
          isVisible: false,
          commands: [],
          selectedIndex: 0,
          position: null,
          search: '',
        }));

        focusEditor();
      }
    } catch (error) {
      // Ignore command execution errors
      setState(prev => ({ ...prev, isVisible: false }));
      focusEditor();
    }
  }, [editor, focusEditor]);

  const closeMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      commands: [],
      selectedIndex: 0,
      position: null,
      search: '',
    }));
  }, []);

  const updateSearch = useCallback((search: string) => {
    setState(prev => ({
      ...prev,
      search,
      selectedIndex: 0,
    }));
  }, []);

  const navigateUp = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: prev.selectedIndex > 0 ? prev.selectedIndex - 1 : prev.commands.length - 1,
    }));
  }, []);

  const navigateDown = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: prev.selectedIndex < prev.commands.length - 1 ? prev.selectedIndex + 1 : 0,
    }));
  }, []);

  useEffect(() => {
    const handleShowSlashMenu = (event: CustomEvent) => {
      const { editor: eventEditor, commands, position } = event.detail;
      if (eventEditor === editor) {
        setState(prev => ({
          ...prev,
          isVisible: true,
          commands,
          selectedIndex: 0,
          position,
          search: '',
        }));
      }
    };

    const handleCloseSlashMenu = () => {
      closeMenu();
    };

    document.addEventListener('show-slash-menu', handleShowSlashMenu as EventListener);
    document.addEventListener('close-slash-menu', handleCloseSlashMenu);

    return () => {
      document.removeEventListener('show-slash-menu', handleShowSlashMenu as EventListener);
      document.removeEventListener('close-slash-menu', handleCloseSlashMenu);
    };
  }, [editor, closeMenu]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    ...state,
    executeCommand,
    closeMenu,
    updateSearch,
    navigateUp,
    navigateDown,
    focusEditor,
  }), [state, executeCommand, closeMenu, updateSearch, navigateUp, navigateDown, focusEditor]);
};