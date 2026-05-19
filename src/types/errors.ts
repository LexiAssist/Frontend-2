/**
 * Typed API error for TanStack Query error handlers
 * Extends Error with common API response properties
 */
export interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
  status?: number;
  code?: string;
}

/**
 * Type guard to check if an unknown error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error || (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  );
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  if (isApiError(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (typeof error === 'string') return error;
  return fallback;
}
