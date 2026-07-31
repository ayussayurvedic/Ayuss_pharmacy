import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any rapidly changing value (e.g. search input).
 * @param value The value to debounce
 * @param delay Milliseconds delay (default: 300ms)
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
