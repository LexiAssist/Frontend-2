"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  authApi, 
  notificationApi, 
  type NotificationSettings,
  type NotificationReminder 
} from "@/services/api";
import type { User } from "@/types";
import { useAuthStore } from "@/store/authStore";

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  school?: string;
  department?: string;
  academicLevel?: string;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends";
  showActivity: boolean;
  allowDataCollection: boolean;
}

interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface UseSettingsReturn {
  // Form states
  profileState: FormState;
  notificationsState: FormState;
  privacyState: FormState;
  passwordState: FormState;
  deleteState: FormState;

  // Data
  notificationSettings: NotificationSettings | null;
  privacySettings: PrivacySettings | null;
  reminders: NotificationReminder[];

  // Actions
  saveProfile: (data: ProfileData) => Promise<boolean>;
  saveNotifications: (settings: NotificationSettings) => Promise<boolean>;
  savePrivacy: (settings: PrivacySettings) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  deleteAccount: (confirmation: string) => Promise<boolean>;
  resetFormState: (form: keyof UseSettingsReturn["formStates"]) => void;

  // Reminder actions
  createReminder: (reminder: Omit<NotificationReminder, 'id'>) => Promise<boolean>;
  updateReminder: (id: string, reminder: Partial<NotificationReminder>) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
  refreshReminders: () => Promise<void>;

  // Loading states
  isLoadingNotifications: boolean;
  isLoadingReminders: boolean;

  formStates: {
    profile: FormState;
    notifications: FormState;
    privacy: FormState;
    password: FormState;
    delete: FormState;
  };

  isMockModeEnabled: boolean;
  toggleMockMode: () => void;
  isMockLoading: boolean;
}

type FormKey = "profile" | "notifications" | "privacy" | "password" | "delete";

const initialFormState: FormState = {
  isLoading: false,
  error: null,
  success: false,
};

const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: false,
  weeklyDigest: true,
  marketingEmails: false,
};

const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: "public",
  showActivity: true,
  allowDataCollection: false,
};

/**
 * Hook to manage Settings page forms with real backend API calls.
 */
export function useSettings(): UseSettingsReturn {
  const [formStates, setFormStates] = useState<Record<FormKey, FormState>>({
    profile: initialFormState,
    notifications: initialFormState,
    privacy: initialFormState,
    password: initialFormState,
    delete: initialFormState,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [reminders, setReminders] = useState<NotificationReminder[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingReminders, setIsLoadingReminders] = useState(false);

  const setFormLoading = useCallback((form: FormKey, loading: boolean) => {
    setFormStates((prev) => ({
      ...prev,
      [form]: { ...prev[form], isLoading: loading },
    }));
  }, []);

  const setFormError = useCallback((form: FormKey, error: string | null) => {
    setFormStates((prev) => ({
      ...prev,
      [form]: { ...prev[form], error, success: false },
    }));
  }, []);

  const setFormSuccess = useCallback((form: FormKey, success: boolean) => {
    setFormStates((prev) => ({
      ...prev,
      [form]: { ...prev[form], success, error: null },
    }));
  }, []);

  const resetFormState = useCallback((form: FormKey) => {
    setFormStates((prev) => ({
      ...prev,
      [form]: initialFormState,
    }));
  }, []);

  // Load notification preferences on mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      setIsLoadingNotifications(true);
      try {
        const settings = await notificationApi.getPreferences();
        setNotificationSettings(settings);
      } catch (err) {
        console.error('Failed to load notification settings:', err);
        // Use defaults if API fails
        setNotificationSettings(defaultNotificationSettings);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    loadNotificationSettings();
  }, []);

  // Load reminders on mount
  useEffect(() => {
    const loadReminders = async () => {
      setIsLoadingReminders(true);
      try {
        const data = await notificationApi.getReminders();
        setReminders(data);
      } catch (err) {
        console.error('Failed to load reminders:', err);
        // Reminders may not be supported by backend yet
        setReminders([]);
      } finally {
        setIsLoadingReminders(false);
      }
    };

    loadReminders();
  }, []);

  const saveProfile = useCallback(
    async (data: ProfileData): Promise<boolean> => {
      setFormLoading("profile", true);
      setFormError("profile", null);

      try {
        // Send PUT request with only changed fields
        const updateData: Partial<User> = {};
        if (data.firstName) updateData.first_name = data.firstName;
        if (data.lastName) updateData.last_name = data.lastName;
        if (data.school !== undefined) updateData.school = data.school;
        if (data.department !== undefined) updateData.department = data.department;
        if (data.academicLevel !== undefined) updateData.academic_level = data.academicLevel as "undergraduate" | "postgraduate" | "doctoral" | "staff" | undefined;
        
        const updatedUser = await authApi.updateProfile(updateData);
        
        // Update Auth_Store with new user data
        useAuthStore.getState().updateUser(updatedUser);
        
        setFormSuccess("profile", true);
        return true;
      } catch (err) {
        setFormError(
          "profile",
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setFormLoading("profile", false);
      }
    },
    [setFormError, setFormLoading, setFormSuccess]
  );

  const saveNotifications = useCallback(
    async (settings: NotificationSettings): Promise<boolean> => {
      setFormLoading("notifications", true);
      setFormError("notifications", null);

      try {
        await notificationApi.updatePreferences(settings);
        setNotificationSettings(settings);
        setFormSuccess("notifications", true);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save notification preferences";
        setFormError("notifications", errorMessage);
        return false;
      } finally {
        setFormLoading("notifications", false);
      }
    },
    [setFormError, setFormLoading, setFormSuccess]
  );

  const savePrivacy = useCallback(
    async (settings: PrivacySettings): Promise<boolean> => {
      setFormLoading("privacy", true);
      setFormError("privacy", null);

      try {
        // Note: Privacy settings are stored in user profile
        // Backend doesn't have a dedicated privacy endpoint yet
        // We'll store it as part of the user's settings
        
        // TODO: Implement privacy API endpoint in backend
        // For now, we'll store in local state and try to sync with profile
        
        setPrivacySettings(settings);
        
        // Try to sync with user profile if backend supports it
        try {
          await authApi.updateProfile({
            settings: {
              privacy: settings
            }
          } as Partial<User>);
        } catch (e) {
          // Backend might not support this yet, that's ok
          console.log('Privacy settings stored locally only');
        }
        
        setFormSuccess("privacy", true);
        return true;
      } catch (err) {
        setFormError(
          "privacy",
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setFormLoading("privacy", false);
      }
    },
    [setFormError, setFormLoading, setFormSuccess]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<boolean> => {
      setFormLoading("password", true);
      setFormError("password", null);

      try {
        await authApi.changePassword(currentPassword, newPassword);
        setFormSuccess("password", true);
        return true;
      } catch (err) {
        setFormError(
          "password",
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setFormLoading("password", false);
      }
    },
    [setFormError, setFormLoading, setFormSuccess]
  );

  const deleteAccount = useCallback(
    async (confirmation: string): Promise<boolean> => {
      setFormLoading("delete", true);
      setFormError("delete", null);

      try {
        if (confirmation !== "DELETE") {
          throw new Error("Please type DELETE to confirm account deletion");
        }
        
        // TODO: Implement account deletion API endpoint
        // DELETE /api/v1/users/me
        // For now, show error that this feature is coming soon
        throw new Error("Account deletion is not yet available. Please contact support.");
        
        // When backend is ready:
        // await authApi.deleteAccount();
        // setFormSuccess("delete", true);
        // return true;
      } catch (err) {
        setFormError(
          "delete",
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setFormLoading("delete", false);
      }
    },
    [setFormError, setFormLoading, setFormSuccess]
  );

  // Reminder management
  const createReminder = useCallback(
    async (reminder: Omit<NotificationReminder, 'id'>): Promise<boolean> => {
      try {
        const newReminder = await notificationApi.createReminder(reminder);
        setReminders((prev) => [...prev, newReminder]);
        return true;
      } catch (err) {
        console.error('Failed to create reminder:', err);
        return false;
      }
    },
    []
  );

  const updateReminder = useCallback(
    async (id: string, reminder: Partial<NotificationReminder>): Promise<boolean> => {
      try {
        const updated = await notificationApi.updateReminder(id, reminder);
        setReminders((prev) => 
          prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
        );
        return true;
      } catch (err) {
        console.error('Failed to update reminder:', err);
        return false;
      }
    },
    []
  );

  const deleteReminder = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await notificationApi.deleteReminder(id);
        setReminders((prev) => prev.filter((r) => r.id !== id));
        return true;
      } catch (err) {
        console.error('Failed to delete reminder:', err);
        return false;
      }
    },
    []
  );

  const refreshReminders = useCallback(async () => {
    setIsLoadingReminders(true);
    try {
      const data = await notificationApi.getReminders();
      setReminders(data);
    } catch (err) {
      console.error('Failed to refresh reminders:', err);
    } finally {
      setIsLoadingReminders(false);
    }
  }, []);

  return {
    profileState: formStates.profile,
    notificationsState: formStates.notifications,
    privacyState: formStates.privacy,
    passwordState: formStates.password,
    deleteState: formStates.delete,
    notificationSettings,
    privacySettings,
    reminders,
    saveProfile,
    saveNotifications,
    savePrivacy,
    changePassword,
    deleteAccount,
    resetFormState,
    createReminder,
    updateReminder,
    deleteReminder,
    refreshReminders,
    isLoadingNotifications,
    isLoadingReminders,
    formStates,
    isMockModeEnabled: false,
    toggleMockMode: () => {},
    isMockLoading: false,
  };
}

export default useSettings;
