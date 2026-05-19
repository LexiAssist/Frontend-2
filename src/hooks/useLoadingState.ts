/**
 * useLoadingState Hook
 * 
 * Custom hook for managing loading states with automatic error handling
 * and toast notifications.
 * 
 * Requirements: 22.1, 22.5
 */

'use client';

import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { Toast } from '@/components/Toast';

interface UseLoadingStateOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    showSuccessToast = false,
    successMessage = 'Operation completed successfully',
    showErrorToast = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler({ showToast: showErrorToast });

  const execute = useCallback(
    async <T,>(
      asyncFunction: () => Promise<T>
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFunction();
        
        if (showSuccessToast) {
          Toast.success(successMessage);
        }
        
        return result;
      } catch (err) {
        const apiError = handleError(err);
        setError(apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, showSuccessToast, successMessage]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
  };
}

/**
 * useUploadProgress Hook
 * 
 * Custom hook for managing file upload progress
 * Requirement 22.2, 22.3: Display progress bar for file uploads
 */
export function useUploadProgress() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const startUpload = useCallback(() => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
  }, []);

  const updateProgress = useCallback((value: number) => {
    setProgress(Math.min(Math.max(value, 0), 100));
  }, []);

  const completeUpload = useCallback(() => {
    setProgress(100);
    setIsUploading(false);
  }, []);

  const failUpload = useCallback((err: unknown) => {
    const apiError = handleError(err);
    setError(apiError);
    setIsUploading(false);
  }, [handleError]);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  return {
    progress,
    isUploading,
    error,
    startUpload,
    updateProgress,
    completeUpload,
    failUpload,
    reset,
  };
}
