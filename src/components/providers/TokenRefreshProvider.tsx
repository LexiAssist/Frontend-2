'use client';

import { useEffect, useRef } from 'react';
import { initTokenRefresh } from '@/services/api';

/**
 * TokenRefreshProvider
 * 
 * Initializes automatic token refresh on app startup.
 * This ensures tokens are refreshed proactively before they expire,
 * preventing 401 errors during API calls.
 */
export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Initialize token refresh system
    cleanupRef.current = initTokenRefresh();
    
    return () => {
      // Cleanup on unmount
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return <>{children}</>;
}
