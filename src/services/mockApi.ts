// Mock API service for development without backend
// Note: Mock mode is now strictly isolated to the settings page.
// Core features (Auth, Materials, Flashcards) require real backend services.

const MOCK_DELAY = 500;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if the application is running in mock mode
 * @returns true if mock mode is enabled via environment variables
 */
export const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || 
         process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
};

/**
 * Mock Settings API
 * Used exclusively for the Settings Page and Dark Mode testing.
 */
export const mockSettingsApi = {
  async getPreferences() {
    await delay(MOCK_DELAY);
    return {
      data: {
        theme: 'dark',
        notificationsEnabled: true,
        language: 'en',
      }
    };
  },
  
  async updateTheme(theme: 'light' | 'dark' | 'system') {
    await delay(MOCK_DELAY);
    return { data: { theme } };
  }
};

/**
 * @deprecated Use real API services instead
 * Mock mode is no longer supported for core features.
 */
export const mockAuthApi = null;

/**
 * @deprecated Use real API services instead
 * Mock mode is no longer supported for core features.
 */
export const mockMaterialsApi = null;

/**
 * @deprecated Use real API services instead
 * Mock mode is no longer supported for core features.
 */
export const mockFlashcardsApi = null;