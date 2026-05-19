'use client';

import { useEffect, useState } from 'react';
import { tokenManager } from '@/services/tokenManager';

/**
 * Hook for debugging token state
 * Usage: const debug = useTokenDebug();
 * Returns token info including expiry, refresh status, etc.
 */
export function useTokenDebug() {
  const [debugInfo, setDebugInfo] = useState(tokenManager.getDebugInfo());

  useEffect(() => {
    // Update every 10 seconds
    const interval = setInterval(() => {
      setDebugInfo(tokenManager.getDebugInfo());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return debugInfo;
}

/**
 * Trigger manual token refresh
 * Useful for testing or forcing a refresh
 */
export function useManualTokenRefresh() {
  return async () => {
    console.log('[Manual Refresh] Triggering token refresh...');
    const result = await tokenManager.performRefresh();
    console.log('[Manual Refresh] Result:', result);
    return result;
  };
}
