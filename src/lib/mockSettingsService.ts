/**
 * Mock Settings Service
 * 
 * This service simulates backend API calls for the Settings page ONLY.
 * It provides realistic network delays and success/error responses.
 * 
 * IMPORTANT: This mock logic is isolated to the Settings page and does NOT
 * affect API calls for the rest of the application.
 */

const DEFAULT_DELAY = 1000; // 1 second to simulate network latency

export interface MockResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends";
  showActivity: boolean;
  allowDataCollection: boolean;
}

/**
 * Simulates a network delay using setTimeout wrapped in a Promise
 */
function simulateDelay(ms: number = DEFAULT_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock response with optional random error simulation
 */
function createMockResponse<T>(
  data: T,
  shouldError: boolean = false,
  errorMessage: string = "An unexpected error occurred"
): MockResponse<T> {
  if (shouldError) {
    return {
      success: false,
      error: errorMessage,
      message: errorMessage,
    };
  }

  return {
    success: true,
    data,
    message: "Operation completed successfully",
  };
}

/**
 * Mock service for Settings page API calls
 */
export const mockSettingsService = {
  /**
   * Simulates saving profile settings
   */
  async saveProfile(data: ProfileData): Promise<MockResponse<ProfileData>> {
    await simulateDelay();

    // Simulate validation
    if (!data.email || !data.email.includes("@")) {
      return createMockResponse(
        data,
        true,
        "Please enter a valid email address"
      );
    }

    if (!data.firstName.trim() || !data.lastName.trim()) {
      return createMockResponse(
        data,
        true,
        "First name and last name are required"
      );
    }

    console.log("[MOCK] Profile saved:", data);
    return createMockResponse({
      ...data,
      bio: data.bio || "",
    });
  },

  /**
   * Simulates saving notification settings
   */
  async saveNotifications(
    settings: NotificationSettings
  ): Promise<MockResponse<NotificationSettings>> {
    await simulateDelay();

    console.log("[MOCK] Notifications saved:", settings);
    return createMockResponse(settings);
  },

  /**
   * Simulates saving privacy settings
   */
  async savePrivacy(
    settings: PrivacySettings
  ): Promise<MockResponse<PrivacySettings>> {
    await simulateDelay();

    console.log("[MOCK] Privacy settings saved:", settings);
    return createMockResponse(settings);
  },

  /**
   * Simulates changing password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<MockResponse<{ passwordChanged: boolean }>> {
    await simulateDelay();

    // Simulate password validation
    if (!currentPassword || currentPassword.length < 6) {
      return createMockResponse(
        { passwordChanged: false },
        true,
        "Current password is incorrect"
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return createMockResponse(
        { passwordChanged: false },
        true,
        "New password must be at least 8 characters"
      );
    }

    console.log("[MOCK] Password changed successfully");
    return createMockResponse({ passwordChanged: true });
  },

  /**
   * Simulates account deletion
   */
  async deleteAccount(
    confirmation: string
  ): Promise<MockResponse<{ deleted: boolean }>> {
    await simulateDelay(1500); // Slightly longer for destructive action

    if (confirmation !== "DELETE") {
      return createMockResponse(
        { deleted: false },
        true,
        "Please type DELETE to confirm account deletion"
      );
    }

    console.log("[MOCK] Account deleted");
    return createMockResponse({ deleted: true });
  },

  /**
   * Simulates fetching user settings
   */
  async fetchSettings(): Promise<
    MockResponse<{
      profile: ProfileData;
      notifications: NotificationSettings;
      privacy: PrivacySettings;
    }>
  > {
    await simulateDelay(800);

    return createMockResponse({
      profile: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        bio: "Learning enthusiast",
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        marketingEmails: false,
      },
      privacy: {
        profileVisibility: "public",
        showActivity: true,
        allowDataCollection: false,
      },
    });
  },
};

export default mockSettingsService;
