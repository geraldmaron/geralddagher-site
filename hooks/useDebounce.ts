/**
 * Debounce Hook with Deep Equality
 * 
 * Custom hook for debouncing values with deep equality comparison
 * to prevent unnecessary re-renders and API calls.
 */

import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Fast deep equality comparison for objects and arrays
 * 
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are deeply equal
 */
function fastDeepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a)) {
      const arrA = a as unknown[];
      const arrB = b as unknown[];
      if (arrA.length !== arrB.length) return false;
      for (let i = 0; i < arrA.length; i++) {
        if (!fastDeepEqual(arrA[i], arrB[i])) return false;
      }
      return true;
    }
    
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!fastDeepEqual(objA[key], objB[key])) return false;
    }
    return true;
  }
  
  return false;
}

/**
 * Debounces a value with configurable delay and deep equality checking
 * 
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const valueRef = useRef<T>(value);
  const isFirstRender = useRef(true);

  const hasChanged = useMemo(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return false;
    }
    if (value === valueRef.current) {
      return false;
    }
    return !fastDeepEqual(value, valueRef.current);
  }, [value]);

  useEffect(() => {
    if (!hasChanged) {
      return;
    }
    
    valueRef.current = value;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasChanged, value, delay]);

  return debouncedValue;
}