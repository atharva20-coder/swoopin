"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useDebounce - Debounce a value
 * 
 * How it works:
 * - When value changes, wait for delay before updating
 * - If value changes again before delay, restart the timer
 * - Only the final value after "settling" is returned
 * 
 * Use case: Search input that triggers API calls
 * Without debounce: API call on every keystroke
 * With debounce: API call only after user stops typing
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timer if value changes before delay completes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback - Debounce a callback function
 * 
 * How it works:
 * - When callback is called, wait for delay before executing
 * - If called again before delay, restart the timer
 * - Only the final call after "settling" executes
 * 
 * Use case: Save button that shouldn't trigger multiple times
 * Without debounce: Multiple save requests on rapid clicks
 * With debounce: Only one save after user stops clicking
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns A debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * useThrottle - Throttle a value (rate limit updates)
 * 
 * How it works:
 * - Only allows value to change once per interval
 * - Unlike debounce, first value is returned immediately
 * - Good for continuous events like scrolling
 * 
 * @param value - The value to throttle
 * @param limit - Minimum time between updates in ms (default: 300ms)
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, limit: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Utility: debounce function (non-hook version)
 * For use in non-React contexts
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Utility: throttle function (non-hook version)
 * For use in non-React contexts
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
