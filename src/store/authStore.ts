import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/services/api';
import { wsClient } from '@/services/websocket';

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, tokens: Tokens) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshAccessToken: () => Promise<boolean>;
  isTokenExpired: () => boolean;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      login: (user, tokens) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: tokens.expiresAt,
        }),

      logout: async () => {
        const { accessToken } = get();
        
        // Disconnect WebSocket first to prevent auth errors
        wsClient.disconnect();
        
        // Clear state immediately
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
        });

        // Only try to call logout API if we have a token
        if (accessToken) {
          try {
            await Promise.race([
              authApi.logout(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
            ]);
          } catch (error) {
            console.log('Logout API call failed (token may be expired), local state cleared');
          }
        }
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          return false;
        }

        try {
          const response = await authApi.refreshToken(refreshToken);
          
          set({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            tokenExpiresAt: response.expires_at,
            user: response.user,
          });
          
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Clear auth state on refresh failure
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
          });
          return false;
        }
      },

      isTokenExpired: () => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return true;
        
        // Check if token expires in the next 5 minutes
        const expiresAt = new Date(tokenExpiresAt);
        const now = new Date();
        const fiveMinutes = 5 * 60 * 1000;
        
        return expiresAt.getTime() - now.getTime() < fiveMinutes;
      },
    }),
    {
      name: 'lexi-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
      }),
    }
  )
);

// Helper function to get auth headers for API calls
export function getAuthHeaders() {
  const { accessToken } = useAuthStore.getState();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// Emergency clear auth - can be called from console: window.clearAuth()
export function clearAuthEmergency() {
  localStorage.removeItem('lexi-auth-storage');
  window.location.href = '/login?error=cleared';
}

// Attach to window for emergency access
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).clearAuth = clearAuthEmergency as unknown;
}

// Helper to check auth status on app load
export async function initializeAuth() {
  const store = useAuthStore.getState();
  store.setLoading(true);

  try {
    // Check if we have tokens
    if (store.accessToken && !store.isTokenExpired()) {
      // Token is valid, fetch current user
      const user = await authApi.getMe();
      store.setUser(user);
    } else if (store.refreshToken) {
      // Token expired but we have refresh token
      const refreshed = await store.refreshAccessToken();
      if (!refreshed) {
        wsClient.disconnect();
        store.setUser(null);
      }
    } else {
      // No tokens, user is not authenticated
      wsClient.disconnect();
      store.setUser(null);
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
    wsClient.disconnect();
    store.setUser(null);
  } finally {
    store.setLoading(false);
  }
}
