'use client';

import { useEffect, useRef } from 'react';
import { initTokenRefresh } from '@/services/api';
import { initializeAuth } from '@/store/authStore';

/**
 * TokenRefreshProvider
 * 
 * Initializes auth state and automatic token refresh on app startup.
 * This validates the session on page reload and ensures tokens are
 * refreshed proactively before they expire.
 */
export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Validate auth state on app startup (page reload)
    // This sets isLoading=false after checking tokens
    initializeAuth();

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
