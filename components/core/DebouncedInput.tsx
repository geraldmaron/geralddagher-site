import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onCommit?: (value: string) => void;
  debounceMs?: number;
  immediate?: boolean;
  className?: string;
  error?: boolean;
}

export const DebouncedInput = forwardRef<HTMLInputElement, DebouncedInputProps>(
  (
    {
      value,
      onChange,
      onCommit,
      debounceMs = 100,
      immediate = false,
      className,
      error = false,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const isInitialMount = useRef(true);

    useEffect(() => {
      if (!isFocused && localValue !== value) {
        setLocalValue(value);
      }
    }, [value, isFocused]);

    useEffect(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      if (immediate) {
        onChange(localValue);
        return;
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        onChange(localValue);
      }, debounceMs);

      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }, [localValue, onChange, debounceMs, immediate]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
    }, []);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    }, [onFocus]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      if (onCommit && localValue !== value) {
        onCommit(localValue);
      }
      
      onBlur?.(e);
    }, [onBlur, onCommit, localValue, value]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onCommit) {
        e.preventDefault();
        onCommit(localValue);
      }
      
      props.onKeyDown?.(e);
    }, [localValue, onCommit, props]);

    useEffect(() => {
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }, []);

    return (
      <input
        ref={ref}
        {...props}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all',
          error
            ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
            : 'border-neutral-200 dark:border-neutral-700',
          className
        )}
      />
    );
  }
);

DebouncedInput.displayName = 'DebouncedInput';
