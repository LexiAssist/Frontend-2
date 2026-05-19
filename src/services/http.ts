/**
 * HTTP Client with Fetch API
 * 
 * Base HTTP client using native fetch API for all backend communication.
 * Implements automatic token refresh, retry logic, and error handling.
 */

import { env } from '@/env';
import { useAuthStore } from '@/store/authStore';
import { tokenManager } from '@/services/tokenManager';
import { APIError, getUserFriendlyMessage } from '@/lib/errorHandler';

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * APIClient class - Base HTTP client with fetch API
 * 
 * Features:
 * - Automatic JWT token injection
 * - Token expiry detection and refresh
 * - Request queuing during token refresh
 * - Retry logic with exponential backoff
 * - Configurable timeouts (30s default, 5min for AI)
 */
class APIClient {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds
  private aiTimeout: number = 300000; // 5 minutes

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Main fetch method with token refresh and retry logic
   * 
   * @param endpoint - API endpoint (relative to baseURL)
   * @param options - Fetch options with additional retry/timeout config
   * @returns Promise with typed response data
   */
  async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = options.timeout || this.defaultTimeout;
    const maxRetries = options.retries !== undefined ? options.retries : 3;
    const retryDelay = options.retryDelay || 1000;

    const isAuthEndpoint = endpoint.includes('/auth/login') ||
                           endpoint.includes('/auth/register') ||
                           endpoint.includes('/auth/refresh');

    // Single source of truth for token — delegates to tokenManager
    let accessToken: string | null = null;
    if (!isAuthEndpoint) {
      accessToken = await tokenManager.getValidToken();
      if (!accessToken) {
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        throw new APIError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED');
      }
    }

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 401 — delegate refresh to tokenManager, retry once
        if (response.status === 401 && !isAuthEndpoint && attempt === 0) {
          const refreshed = await tokenManager.handleUnauthorized();
          if (refreshed) {
            const newToken = useAuthStore.getState().accessToken;
            headers['Authorization'] = `Bearer ${newToken}`;
            continue;
          } else {
            throw new APIError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED');
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const retryAfter = response.headers.get('retry-after');
          const retryAfterSeconds = retryAfter ? parseInt(retryAfter) : undefined;
          const errorMessage = errorData.message || errorData.error ||
                               getUserFriendlyMessage(response.status, retryAfterSeconds);

          throw new APIError(errorMessage, response.status, errorData.code, errorData.errors, retryAfterSeconds);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text() as T;
        }
      } catch (error) {
        lastError = error as Error;

        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new APIError('Request timed out. Please try again.', 0, 'TIMEOUT_ERROR');
        }

        if (error instanceof APIError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 401) {
          throw error;
        }

        if (attempt === maxRetries) throw error;

        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }

    throw lastError || new APIError('Request failed after retries', 0, 'REQUEST_FAILED');
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request with JSON body
   */
  post<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request with JSON body
   */
  put<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload FormData with progress tracking
   * 
   * @param endpoint - API endpoint
   * @param formData - FormData object with file and metadata
   * @param onProgress - Optional progress callback (0-100)
   * @returns Promise with typed response data
   */
  async uploadFormData<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const { accessToken } = useAuthStore.getState();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve(xhr.responseText as T);
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || `Upload failed: ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', url);
      
      if (accessToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      }

      xhr.send(formData);
    });
  }
}

/**
 * Main API client instance for backend services
 */
export const apiClient = new APIClient(
  env.NEXT_PUBLIC_API_GATEWAY_URL
);

/**
 * AI-specific API client with extended timeout
 */
export const aiClient = new APIClient(
  env.NEXT_PUBLIC_AI_PROXY_URL
);

/**
 * Typed HTTP methods - unwraps ApiResponse wrapper to return raw data
 */
export const http = {
  get: <T>(url: string, options?: FetchOptions) =>
    apiClient.get<ApiResponse<T>>(url, options).then((res) => res.data),

  post: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    apiClient.post<ApiResponse<T>>(url, data, options).then((res) => res.data),

  put: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    apiClient.put<ApiResponse<T>>(url, data, options).then((res) => res.data),

  delete: <T>(url: string, options?: FetchOptions) =>
    apiClient.delete<ApiResponse<T>>(url, options).then((res) => res.data),
};

/**
 * AI HTTP methods with extended timeout
 */
export const aiHttp = {
  post: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    aiClient.post<T>(url, data, { timeout: 300000, ...options }),

  get: <T>(url: string, options?: FetchOptions) =>
    aiClient.get<T>(url, { timeout: 300000, ...options }),

  uploadFormData: <T>(url: string, formData: FormData, onProgress?: (progress: number) => void) =>
    aiClient.uploadFormData<T>(url, formData, onProgress),
};

export default apiClient;
