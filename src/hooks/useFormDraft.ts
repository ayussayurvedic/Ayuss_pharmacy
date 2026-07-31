'use client';

import { useEffect, useRef } from 'react';

/**
 * A custom hook to auto-save form draft values to localStorage
 * and automatically restore them on mount (crash recovery/dirty prevention).
 * 
 * @param storageKey Unique key to identify the form draft
 * @param currentValues Current form state values
 * @param onRestore Callback triggered on mount with recovered draft values
 * @param saveIntervalMs Frequency of draft auto-save (default: 10000ms)
 */
export function useFormDraft<T extends Record<string, any>>(
  storageKey: string,
  currentValues: T,
  onRestore: (recovered: T) => void,
  saveIntervalMs = 10000
) {
  const currentValuesRef = useRef(currentValues);
  currentValuesRef.current = currentValues;

  // 1. Recover draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as T;
        // Verify it is not an empty object
        if (Object.keys(parsed).length > 0) {
          onRestore(parsed);
          // Announce to screen readers
          window.dispatchEvent(
            new CustomEvent('admin-announce', {
              detail: 'Recovered unsaved draft form values.',
            })
          );
        }
      }
    } catch (err) {
      console.warn('Failed to restore form draft from localStorage', err);
    }
  }, [storageKey]);

  // 2. Periodically save draft
  useEffect(() => {
    const saveDraft = () => {
      try {
        const values = currentValuesRef.current;
        if (values && Object.keys(values).length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(values));
        }
      } catch (err) {
        console.warn('Failed to save form draft to localStorage', err);
      }
    };

    const interval = setInterval(saveDraft, saveIntervalMs);
    
    // Save draft when window is about to unload/close
    window.addEventListener('beforeunload', saveDraft);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', saveDraft);
    };
  }, [storageKey, saveIntervalMs]);

  // 3. Clear draft helper (to call on successful form submit)
  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.warn('Failed to clear form draft from localStorage', err);
    }
  };

  return { clearDraft };
}
