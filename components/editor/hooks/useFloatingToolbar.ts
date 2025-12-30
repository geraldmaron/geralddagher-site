import { useState, useEffect, useCallback } from 'react';
import { Editor as SlateEditor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Highlighter,
  Subscript,
  Superscript,
} from 'lucide-react';

interface ToolbarAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  active?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
}

interface FloatingToolbarState {
  isVisible: boolean;
  position: { top: number; left: number } | null;
  actions: ToolbarAction[];
}

export const useFloatingToolbar = (editor: any) => {
  const [state, setState] = useState<FloatingToolbarState>({
    isVisible: false,
    position: null,
    actions: [],
  });

  const updatePosition = useCallback((forceUpdate = false) => {
    const { selection } = editor;
    if (!selection || Range.isCollapsed(selection)) {
      setState(prev => ({ ...prev, isVisible: false }));
      return;
    }

    try {
      const domRange = ReactEditor.toDOMRange(editor, selection);
      const rect = domRange.getBoundingClientRect();

      if (rect.width === 0 && rect.height === 0) {
        setState(prev => ({ ...prev, isVisible: false }));
        return;
      }

      const marks = SlateEditor.marks(editor) || {};
      
      const actions: ToolbarAction[] = [
        {
          id: 'bold',
          label: 'Bold',
          icon: Bold,
          active: marks.bold === true,
          variant: 'primary',
          action: () => {
            try {
              const marks = SlateEditor.marks(editor);
              const isActive = marks ? marks.bold === true : false;
              if (isActive) {
                SlateEditor.removeMark(editor, 'bold');
              } else {
                SlateEditor.addMark(editor, 'bold', true);
              }
            } catch (error) {
              SlateEditor.addMark(editor, 'bold', true);
            }
          },
        },
        {
          id: 'italic',
          label: 'Italic',
          icon: Italic,
          active: marks.italic === true,
          action: () => {
            try {
              const marks = SlateEditor.marks(editor);
              const isActive = marks ? marks.italic === true : false;
              if (isActive) {
                SlateEditor.removeMark(editor, 'italic');
              } else {
                SlateEditor.addMark(editor, 'italic', true);
              }
            } catch (error) {
              SlateEditor.addMark(editor, 'italic', true);
            }
          },
        },
        {
          id: 'underline',
          label: 'Underline',
          icon: Underline,
          active: marks.underline === true,
          action: () => {
            try {
              const marks = SlateEditor.marks(editor);
              const isActive = marks ? marks.underline === true : false;
              if (isActive) {
                SlateEditor.removeMark(editor, 'underline');
              } else {
                SlateEditor.addMark(editor, 'underline', true);
              }
            } catch (error) {
              SlateEditor.addMark(editor, 'underline', true);
            }
          },
        },
        {
          id: 'strikethrough',
          label: 'Strikethrough',
          icon: Strikethrough,
          active: marks.strikethrough === true,
          action: () => {
            try {
              const marks = SlateEditor.marks(editor);
              const isActive = marks ? marks.strikethrough === true : false;
              if (isActive) {
                SlateEditor.removeMark(editor, 'strikethrough');
              } else {
                SlateEditor.addMark(editor, 'strikethrough', true);
              }
            } catch (error) {
              SlateEditor.addMark(editor, 'strikethrough', true);
            }
          },
        },
        {
          id: 'code',
          label: 'Inline Code',
          icon: Code,
          active: marks.code === true,
          action: () => {
            try {
              const marks = SlateEditor.marks(editor);
              const isActive = marks ? marks.code === true : false;
              if (isActive) {
                SlateEditor.removeMark(editor, 'code');
              } else {
                SlateEditor.addMark(editor, 'code', true);
              }
            } catch (error) {
              SlateEditor.addMark(editor, 'code', true);
            }
          },
        },
        {
          id: 'highlight',
          label: 'Highlight',
          icon: Highlighter,
          active: marks.highlight === true,
          variant: 'warning',
          action: () => {
            try {
              const marks = SlateEditor.marks(editor);
              const isActive = marks ? marks.highlight === true : false;
              if (isActive) {
                SlateEditor.removeMark(editor, 'highlight');
              } else {
                SlateEditor.addMark(editor, 'highlight', true);
              }
            } catch (error) {
              SlateEditor.addMark(editor, 'highlight', true);
            }
          },
        },
        {
          id: 'superscript',
          label: 'Superscript',
          icon: Superscript,
          active: marks.superscript === true,
          action: () => {
            try {
              const marks = SlateEditor.marks(editor);
              const isActive = marks ? marks.superscript === true : false;

              if (marks && marks.subscript) {
                SlateEditor.removeMark(editor, 'subscript');
              }

              if (isActive) {
                SlateEditor.removeMark(editor, 'superscript');
              } else {
                SlateEditor.addMark(editor, 'superscript', true);
              }
            } catch (error) {
              SlateEditor.addMark(editor, 'superscript', true);
            }
          },
        },
        {
          id: 'subscript',
          label: 'Subscript',
          icon: Subscript,
          active: marks.subscript === true,
          action: () => {
            try {
              const marks = SlateEditor.marks(editor);
              const isActive = marks ? marks.subscript === true : false;

              if (marks && marks.superscript) {
                SlateEditor.removeMark(editor, 'superscript');
              }

              if (isActive) {
                SlateEditor.removeMark(editor, 'subscript');
              } else {
                SlateEditor.addMark(editor, 'subscript', true);
              }
            } catch (error) {
              SlateEditor.addMark(editor, 'subscript', true);
            }
          },
        },
      ];

      const TOOLBAR_OFFSET = 80;
      const position = {
        top: rect.top + window.scrollY - TOOLBAR_OFFSET,
        left: rect.left + window.scrollX + rect.width / 2,
      };

      setState({
        isVisible: true,
        position,
        actions,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isVisible: false }));
    }
  }, [editor]);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const executeAction = useCallback((actionId: string) => {
    const action = state.actions.find(a => a.id === actionId);
    if (action) {
      action.action();
    }
  }, [state.actions]);

  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout | null = null;

    const handleSelectionChange = () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      debounceTimeout = setTimeout(() => {
        updatePosition();
      }, 50);
    };

    const editorElement = document.querySelector('[data-slate-editor="true"]');
    if (editorElement) {
      editorElement.addEventListener('mouseup', handleSelectionChange);
      editorElement.addEventListener('keyup', handleSelectionChange);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      if (editorElement) {
        editorElement.removeEventListener('mouseup', handleSelectionChange);
        editorElement.removeEventListener('keyup', handleSelectionChange);
      }
    };
  }, [updatePosition]);

  return {
    ...state,
    updatePosition,
    close,
    executeAction,
  };
};
