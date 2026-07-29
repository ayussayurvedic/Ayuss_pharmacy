'use client';

import { useState } from 'react';

export function useOfflineSync() {
  const [isOnline] = useState(true);
  const [pendingCount] = useState(0);
  const [isSyncing] = useState(false);
  const [lastSyncResult] = useState<'success' | 'partial' | 'failed' | null>(null);

  const syncQueue = async () => {};
  const dismissEntry = () => {};
  const refreshPendingCount = () => {};

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncResult,
    syncQueue,
    dismissEntry,
    refreshPendingCount,
  };
}
