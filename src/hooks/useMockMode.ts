"use client";

import { useState, useCallback } from "react";

const MOCK_MODE_KEY = "lexiassist-settings-mock-mode";

interface UseMockModeReturn {
  isMockModeEnabled: boolean;
  toggleMockMode: () => void;
  setMockMode: (enabled: boolean) => void;
  isLoading: boolean;
}

/**
 * Hook to manage Developer Mock Mode state for Settings page.
 * Persists the mock mode preference in localStorage.
 * This mock mode ONLY affects Settings page forms.
 */
export function useMockMode(): UseMockModeReturn {
  const [isMockModeEnabled, setIsMockModeEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(MOCK_MODE_KEY);
    return stored === "true";
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Persist to localStorage whenever mock mode changes
  const setMockMode = useCallback((enabled: boolean) => {
    setIsMockModeEnabled(enabled);
    localStorage.setItem(MOCK_MODE_KEY, String(enabled));
  }, []);

  const toggleMockMode = useCallback(() => {
    setMockMode(!isMockModeEnabled);
  }, [isMockModeEnabled, setMockMode]);

  return {
    isMockModeEnabled,
    toggleMockMode,
    setMockMode,
    isLoading,
  };
}

export default useMockMode;
