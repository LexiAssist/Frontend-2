/**
 * Token Refresh Manager
 * 
 * Handles automatic token refresh with:
 * - Proactive refresh before expiry (2 minutes buffer)
 * - Request deduplication (only one refresh at a time)
 * - Request queueing during refresh
 * - Smooth silent refresh without user interruption
 */

import { useAuthStore } from '@/store/authStore';

// Token refresh states
enum RefreshState {
  IDLE = 'idle',
  REFRESHING = 'refreshing',
  FAILED = 'failed',
}

class TokenManager {
  private state: RefreshState = RefreshState.IDLE;
  private refreshPromise: Promise<boolean> | null = null;
  private requestQueue: Array<() => void> = [];
  
  // Buffer time before expiry to trigger proactive refresh (2 minutes)
  private readonly PROACTIVE_REFRESH_BUFFER = 2 * 60 * 1000;
  
  // Singleton instance
  private static instance: TokenManager;
  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Check if token needs refresh (proactive or reactive)
   */
  shouldRefreshToken(): boolean {
    const { tokenExpiresAt, accessToken } = useAuthStore.getState();
    
    if (!accessToken || !tokenExpiresAt) return false;
    
    const expiresAt = new Date(tokenExpiresAt).getTime();
    const now = Date.now();
    
    // Refresh if token expires within buffer time
    return expiresAt - now < this.PROACTIVE_REFRESH_BUFFER;
  }

  /**
   * Check if token is already expired
   */
  isTokenExpired(): boolean {
    const { tokenExpiresAt, accessToken } = useAuthStore.getState();
    
    if (!accessToken || !tokenExpiresAt) return true;
    
    const expiresAt = new Date(tokenExpiresAt).getTime();
    const now = Date.now();
    
    return now >= expiresAt;
  }

  /**
   * Get valid access token
   * Refreshes proactively if needed
   */
  async getValidToken(): Promise<string | null> {
    const { accessToken } = useAuthStore.getState();
    
    // If no token, return null
    if (!accessToken) return null;
    
    // If token is valid and not near expiry, return it
    if (!this.shouldRefreshToken()) {
      return accessToken;
    }
    
    // Token needs refresh - do it
    const refreshed = await this.performRefresh();
    
    if (refreshed) {
      return useAuthStore.getState().accessToken;
    }
    
    return null;
  }

  /**
   * Perform token refresh with deduplication
   * Only one refresh happens even if multiple requests call this simultaneously
   */
  async performRefresh(): Promise<boolean> {
    // If already refreshing, wait for it to complete
    if (this.state === RefreshState.REFRESHING && this.refreshPromise) {
      console.log('[TokenManager] Refresh already in progress, waiting...');
      return this.refreshPromise;
    }
    
    // Start refresh
    this.state = RefreshState.REFRESHING;
    
    this.refreshPromise = this.doRefresh();
    
    try {
      const result = await this.refreshPromise;
      
      if (result) {
        this.state = RefreshState.IDLE;
        this.processQueue();
      } else {
        this.state = RefreshState.FAILED;
        this.clearQueue();
      }
      
      return result;
    } catch (error) {
      this.state = RefreshState.FAILED;
      this.clearQueue();
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Actual refresh logic
   */
  private async doRefresh(): Promise<boolean> {
    const { refreshAccessToken, logout } = useAuthStore.getState();
    
    if (!refreshAccessToken) {
      console.error('[TokenManager] No refresh function available');
      return false;
    }
    
    try {
      console.log('[TokenManager] Refreshing access token...');
      const result = await refreshAccessToken();
      
      if (result) {
        console.log('[TokenManager] Token refreshed successfully');
      } else {
        console.error('[TokenManager] Token refresh failed');
        logout();
      }
      
      return result;
    } catch (error) {
      console.error('[TokenManager] Token refresh error:', error);
      logout();
      return false;
    }
  }

  /**
   * Handle 401 response - force refresh and retry
   */
  async handleUnauthorized(): Promise<boolean> {
    console.log('[TokenManager] Handling 401 - forcing token refresh');
    return this.performRefresh();
  }

  /**
   * Queue a request to be executed after refresh
   */
  queueRequest(request: () => void): void {
    this.requestQueue.push(request);
  }

  /**
   * Process queued requests after successful refresh
   */
  private processQueue(): void {
    console.log(`[TokenManager] Processing ${this.requestQueue.length} queued requests`);
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        request();
      }
    }
  }

  /**
   * Clear queue on refresh failure
   */
  private clearQueue(): void {
    this.requestQueue = [];
  }

  /**
   * Get current token state for debugging
   */
  getDebugInfo() {
    const { accessToken, tokenExpiresAt } = useAuthStore.getState();
    
    return {
      hasToken: !!accessToken,
      expiresAt: tokenExpiresAt,
      isExpired: this.isTokenExpired(),
      shouldRefresh: this.shouldRefreshToken(),
      state: this.state,
      queueLength: this.requestQueue.length,
    };
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();

// Export for testing
export { TokenManager, RefreshState };
