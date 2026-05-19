/**
 * Centralized Error Handler
 * 
 * Provides utilities for handling API errors, mapping HTTP status codes
 * to user-friendly messages, and extracting field-specific validation errors.
 * 
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public errors?: Record<string, string[]>,
    public retryAfter?: number,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Handle API errors and convert them to APIError instances
 * with user-friendly messages
 */
export function handleAPIError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof Error) {
    // Parse HTTP errors
    const statusMatch = error.message.match(/HTTP (\d+)/);
    if (statusMatch) {
      const statusCode = parseInt(statusMatch[1]);
      return new APIError(
        getUserFriendlyMessage(statusCode),
        statusCode
      );
    }

    // Network errors
    if (error.message.includes('fetch') || 
        error.message.includes('network') || 
        error.message.includes('Network')) {
      return new APIError(
        'Network error. Please check your connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    // Timeout errors
    if (error.message.includes('timeout') || 
        error.message.includes('aborted') || 
        error.message.includes('AbortError')) {
      return new APIError(
        'Request timed out. Please try again.',
        0,
        'TIMEOUT_ERROR'
      );
    }

    return new APIError(error.message);
  }

  return new APIError('An unexpected error occurred');
}

/**
 * Map HTTP status codes to user-friendly messages
 * 
 * Requirement 21.1: Handle 400 (validation)
 * Requirement 21.2: Handle 401 (auth)
 * Requirement 21.3: Handle 403 (permission)
 * Requirement 21.4: Handle 404 (not found)
 * Requirement 21.5: Handle 429 (rate limit)
 * Requirement 21.6: Handle 500/503 (server error)
 * Requirement 21.7: Handle network errors
 */
export function getUserFriendlyMessage(statusCode: number, retryAfter?: number): string {
  switch (statusCode) {
    case 400:
      return 'Please check your input and try again';
    case 401:
      return 'Your session has expired. Please log in again';
    case 403:
      return "You don't have permission to perform this action";
    case 404:
      return 'The requested resource was not found';
    case 409:
      return 'This resource already exists';
    case 422:
      return 'Please check your input and try again';
    case 429:
      return retryAfter 
        ? `Too many requests. Please try again in ${retryAfter} seconds`
        : 'Too many requests. Please try again later';
    case 500:
      return 'Something went wrong. Please try again later';
    case 503:
      return 'Service temporarily unavailable. Please try again shortly';
    default:
      if (statusCode >= 500) {
        return 'Server error. Please try again later';
      }
      return 'An error occurred. Please try again';
  }
}

/**
 * Extract field-specific validation errors from API error
 * Used for displaying inline form validation errors
 */
export function extractFieldErrors(
  error: APIError
): Record<string, string> | null {
  if (error.errors) {
    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(error.errors)) {
      fieldErrors[field] = messages[0]; // Take first error message
    }
    return fieldErrors;
  }
  return null;
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: APIError): boolean {
  return error.code === 'NETWORK_ERROR' || error.statusCode === 0;
}

/**
 * Check if an error is a timeout error
 */
export function isTimeoutError(error: APIError): boolean {
  return error.code === 'TIMEOUT_ERROR';
}

/**
 * Check if an error should trigger a retry
 */
export function shouldRetry(error: APIError): boolean {
  return isNetworkError(error) || isTimeoutError(error) || !!(error.statusCode && error.statusCode >= 500);
}

/**
 * Get retry delay in milliseconds based on retry attempt
 */
export function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
}
