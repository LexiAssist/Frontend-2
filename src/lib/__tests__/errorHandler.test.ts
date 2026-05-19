/**
 * Error Handler Tests
 * 
 * Unit tests for the centralized error handler
 */

import { 
  APIError, 
  handleAPIError, 
  getUserFriendlyMessage, 
  extractFieldErrors,
  isNetworkError,
  isTimeoutError,
  shouldRetry,
  getRetryDelay
} from '../errorHandler';

describe('errorHandler', () => {
  describe('APIError', () => {
    it('should create an APIError with all properties', () => {
      const error = new APIError(
        'Test error',
        400,
        'TEST_ERROR',
        { field: ['Error message'] },
        60
      );

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.errors).toEqual({ field: ['Error message'] });
      expect(error.retryAfter).toBe(60);
      expect(error.name).toBe('APIError');
    });
  });

  describe('handleAPIError', () => {
    it('should return APIError as-is', () => {
      const apiError = new APIError('Test error', 400);
      const result = handleAPIError(apiError);
      expect(result).toBe(apiError);
    });

    it('should parse HTTP errors from Error messages', () => {
      const error = new Error('HTTP 404: Not Found');
      const result = handleAPIError(error);
      
      expect(result).toBeInstanceOf(APIError);
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('The requested resource was not found');
    });

    it('should detect network errors', () => {
      const error = new Error('Network error occurred');
      const result = handleAPIError(error);
      
      expect(result).toBeInstanceOf(APIError);
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.message).toBe('Network error. Please check your connection.');
    });

    it('should detect timeout errors', () => {
      const error = new Error('Request timeout');
      const result = handleAPIError(error);
      
      expect(result).toBeInstanceOf(APIError);
      expect(result.code).toBe('TIMEOUT_ERROR');
      expect(result.message).toBe('Request timed out. Please try again.');
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');
      const result = handleAPIError(error);
      
      expect(result).toBeInstanceOf(APIError);
      expect(result.message).toBe('Unknown error');
    });

    it('should handle non-Error objects', () => {
      const result = handleAPIError('string error');
      
      expect(result).toBeInstanceOf(APIError);
      expect(result.message).toBe('An unexpected error occurred');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return correct message for 400', () => {
      expect(getUserFriendlyMessage(400)).toBe('Please check your input and try again');
    });

    it('should return correct message for 401', () => {
      expect(getUserFriendlyMessage(401)).toBe('Your session has expired. Please log in again');
    });

    it('should return correct message for 403', () => {
      expect(getUserFriendlyMessage(403)).toBe("You don't have permission to perform this action");
    });

    it('should return correct message for 404', () => {
      expect(getUserFriendlyMessage(404)).toBe('The requested resource was not found');
    });

    it('should return correct message for 429 without retry-after', () => {
      expect(getUserFriendlyMessage(429)).toBe('Too many requests. Please try again later');
    });

    it('should return correct message for 429 with retry-after', () => {
      expect(getUserFriendlyMessage(429, 60)).toBe('Too many requests. Please try again in 60 seconds');
    });

    it('should return correct message for 500', () => {
      expect(getUserFriendlyMessage(500)).toBe('Something went wrong. Please try again later');
    });

    it('should return correct message for 503', () => {
      expect(getUserFriendlyMessage(503)).toBe('Service temporarily unavailable. Please try again shortly');
    });

    it('should return generic message for unknown status codes', () => {
      expect(getUserFriendlyMessage(418)).toBe('An error occurred. Please try again');
    });

    it('should return server error message for 5xx codes', () => {
      expect(getUserFriendlyMessage(502)).toBe('Server error. Please try again later');
    });
  });

  describe('extractFieldErrors', () => {
    it('should extract field errors from APIError', () => {
      const error = new APIError('Validation error', 400, 'VALIDATION_ERROR', {
        email: ['Email is required', 'Email must be valid'],
        password: ['Password is too short'],
      });

      const fieldErrors = extractFieldErrors(error);
      
      expect(fieldErrors).toEqual({
        email: 'Email is required',
        password: 'Password is too short',
      });
    });

    it('should return null if no field errors', () => {
      const error = new APIError('Generic error', 400);
      const fieldErrors = extractFieldErrors(error);
      
      expect(fieldErrors).toBeNull();
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network errors', () => {
      const error = new APIError('Network error', 0, 'NETWORK_ERROR');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for status code 0', () => {
      const error = new APIError('Connection failed', 0);
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new APIError('Server error', 500);
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isTimeoutError', () => {
    it('should return true for timeout errors', () => {
      const error = new APIError('Timeout', 0, 'TIMEOUT_ERROR');
      expect(isTimeoutError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new APIError('Network error', 0, 'NETWORK_ERROR');
      expect(isTimeoutError(error)).toBe(false);
    });
  });

  describe('shouldRetry', () => {
    it('should return true for network errors', () => {
      const error = new APIError('Network error', 0, 'NETWORK_ERROR');
      expect(shouldRetry(error)).toBe(true);
    });

    it('should return true for timeout errors', () => {
      const error = new APIError('Timeout', 0, 'TIMEOUT_ERROR');
      expect(shouldRetry(error)).toBe(true);
    });

    it('should return true for 5xx errors', () => {
      const error = new APIError('Server error', 500);
      expect(shouldRetry(error)).toBe(true);
    });

    it('should return false for 4xx errors', () => {
      const error = new APIError('Bad request', 400);
      expect(shouldRetry(error)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should return exponential backoff delays', () => {
      expect(getRetryDelay(0)).toBe(1000);
      expect(getRetryDelay(1)).toBe(2000);
      expect(getRetryDelay(2)).toBe(4000);
      expect(getRetryDelay(3)).toBe(8000);
    });

    it('should cap at 10 seconds', () => {
      expect(getRetryDelay(10)).toBe(10000);
      expect(getRetryDelay(20)).toBe(10000);
    });
  });
});
