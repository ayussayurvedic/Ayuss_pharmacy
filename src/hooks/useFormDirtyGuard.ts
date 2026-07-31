import { useEffect } from 'react';

/**
 * Hook to warn user before navigating away or reloading if form has unsaved changes.
 * @param isDirty boolean indicating if form has modified, unsaved content
 * @param message custom confirmation message string
 */
export function useFormDirtyGuard(isDirty: boolean, message: string = 'You have unsaved changes. Are you sure you want to leave?') {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);
}
