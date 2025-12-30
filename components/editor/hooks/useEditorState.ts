import { useState, useCallback, useEffect, useRef } from 'react';
import { Descendant, Editor as SlateEditor } from 'slate';

interface EditorState {
  content: Descendant[];
  selection: any;
  isFocused: boolean;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseEditorStateOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const useEditorState = (
  editor: any,
  options: UseEditorStateOptions = {}
) => {
  const { autoSave = false, autoSaveDelay = 2000 } = options;
  
  const [state, setState] = useState<EditorState>({
    content: [],
    selection: null,
    isFocused: false,
    isDirty: false,
    isLoading: false,
    error: null,
  });

  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef<Descendant[]>([]);

  const updateContent = useCallback((content: Descendant[]) => {
    // Use setTimeout to defer state updates to avoid setState during render
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        content,
        isDirty: JSON.stringify(content) !== JSON.stringify(previousContentRef.current),
      }));

      previousContentRef.current = content;

      const text = SlateEditor.string(editor, []);
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharacterCount(text.length);

      if (autoSave && content.length > 0) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        autoSaveTimeoutRef.current = setTimeout(() => {
          setLastSaved(new Date());
        }, autoSaveDelay);
      }
    }, 0);
  }, [editor, autoSave, autoSaveDelay]);

  const updateSelection = useCallback((selection: any) => {
    setState(prev => ({ ...prev, selection }));
  }, []);

  const setFocused = useCallback((isFocused: boolean) => {
    setState(prev => ({ ...prev, isFocused }));
  }, []);

  const setDirty = useCallback((isDirty: boolean) => {
    setState(prev => ({ ...prev, isDirty }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Allow caller to initialize content without marking editor as dirty
  const initializeContent = useCallback((content: Descendant[]) => {
    setState(prev => ({
      ...prev,
      content,
      isDirty: false,
    }));
    previousContentRef.current = content;
    try {
      const text = SlateEditor.string(editor, []);
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharacterCount(text.length);
    } catch {
      // ignore initial counting errors
    }
  }, [editor]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    wordCount,
    characterCount,
    lastSaved,
    updateContent,
    updateSelection,
    setFocused,
    setDirty,
    setLoading,
    setError,
    clearError,
    initializeContent,
  };
};