import { useEffect, useRef, useCallback, useState } from 'react';
import { Descendant } from 'slate';

interface UseAutosaveOptions {
  enabled: boolean;
  delay: number;
  onSave: (content: Descendant[], metadata: any) => Promise<void>;
  content: Descendant[];
  metadata: any;
  isDirty: boolean;
}

interface AutosaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  retryCount: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export function useAutosave({
  enabled,
  delay,
  onSave,
  content,
  metadata,
  isDirty,
}: UseAutosaveOptions) {
  const [state, setState] = useState<AutosaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    retryCount: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const isMountedRef = useRef(true);
  const saveInProgressRef = useRef(false);

  const performSave = useCallback(async () => {
    if (!enabled || !isDirty || saveInProgressRef.current) {
      return;
    }

    const currentContentHash = JSON.stringify({ content, metadata });

    if (currentContentHash === lastSavedContentRef.current) {
      return;
    }

    saveInProgressRef.current = true;

    setState(prev => ({
      ...prev,
      isSaving: true,
      error: null,
    }));

    try {
      await onSave(content, metadata);

      if (isMountedRef.current) {
        lastSavedContentRef.current = currentContentHash;
        setState(prev => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          error: null,
          retryCount: 0,
        }));
      }
    } catch (error: any) {
      console.error('[Autosave] Save failed:', error);

      if (isMountedRef.current) {
        const newRetryCount = state.retryCount + 1;

        setState(prev => ({
          ...prev,
          isSaving: false,
          error: error.message || 'Autosave failed',
          retryCount: newRetryCount,
        }));

        if (newRetryCount < MAX_RETRIES) {

          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              performSave();
            }
          }, RETRY_DELAY * newRetryCount);
        }
      }
    } finally {
      saveInProgressRef.current = false;
    }
  }, [enabled, isDirty, content, metadata, onSave, state.retryCount]);

  useEffect(() => {
    if (!enabled || !isDirty) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSave();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, delay, content, metadata, isDirty, performSave]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !state.isSaving) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, state.isSaving]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isDirty && enabled) {
        performSave();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDirty, enabled, performSave]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performSave();
  }, [performSave]);

  return {
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
    error: state.error,
    forceSave,
  };
}
