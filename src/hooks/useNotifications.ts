"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi, type NotificationSettings, type NotificationReminder, type NotificationHistoryItem } from '@/services/api';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Query keys for notifications
export const notificationKeys = {
  all: ['notifications'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
  reminders: () => [...notificationKeys.all, 'reminders'] as const,
  history: () => [...notificationKeys.all, 'history'] as const,
  devices: () => [...notificationKeys.all, 'devices'] as const,
};

/**
 * Hook to fetch notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationApi.getPreferences(),
    retry: false,
  });
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: NotificationSettings) => notificationApi.updatePreferences(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
      toast.success('Notification preferences saved');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to save preferences');
    },
  });
}

/**
 * Hook to fetch study reminders
 */
export function useReminders() {
  return useQuery({
    queryKey: notificationKeys.reminders(),
    queryFn: () => notificationApi.getReminders(),
    retry: false,
  });
}

/**
 * Hook to create a study reminder
 */
export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminder: Omit<NotificationReminder, 'id'>) => 
      notificationApi.createReminder(reminder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.reminders() });
      toast.success('Reminder created');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create reminder');
    },
  });
}

/**
 * Hook to update a study reminder
 */
export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reminder }: { id: string; reminder: Partial<NotificationReminder> }) =>
      notificationApi.updateReminder(id, reminder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.reminders() });
      toast.success('Reminder updated');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update reminder');
    },
  });
}

/**
 * Hook to delete a study reminder
 */
export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.reminders() });
      toast.success('Reminder deleted');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete reminder');
    },
  });
}

/**
 * Hook to fetch notification history
 */
export function useNotificationHistory(limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...notificationKeys.history(), { limit, offset }],
    queryFn: () => notificationApi.getHistory(limit, offset),
    retry: false,
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.history() });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.history() });
      toast.success('All notifications marked as read');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to mark notifications as read');
    },
  });
}

/**
 * Hook to register device for push notifications
 */
export function useRegisterDevice() {
  return useMutation({
    mutationFn: ({ token, platform }: { token: string; platform: 'web' | 'ios' | 'android' }) =>
      notificationApi.registerDevice({ token, platform }),
    onSuccess: () => {
      toast.success('Device registered for notifications');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to register device');
    },
  });
}

/**
 * Unified notifications hook
 */
export function useNotifications() {
  const preferencesQuery = useNotificationPreferences();
  const remindersQuery = useReminders();
  const updatePreferencesMutation = useUpdateNotificationPreferences();
  const createReminderMutation = useCreateReminder();
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();

  return {
    // Data
    preferences: preferencesQuery.data,
    reminders: remindersQuery.data,
    
    // Loading states
    isLoading: preferencesQuery.isLoading || remindersQuery.isLoading,
    isError: preferencesQuery.isError || remindersQuery.isError,
    
    // Actions
    updatePreferences: updatePreferencesMutation.mutateAsync,
    createReminder: createReminderMutation.mutateAsync,
    updateReminder: updateReminderMutation.mutateAsync,
    deleteReminder: deleteReminderMutation.mutateAsync,
    
    // Mutation states
    isUpdating: updatePreferencesMutation.isPending,
    isCreatingReminder: createReminderMutation.isPending,
    isUpdatingReminder: updateReminderMutation.isPending,
    isDeletingReminder: deleteReminderMutation.isPending,
    
    // Refetch
    refetch: () => {
      preferencesQuery.refetch();
      remindersQuery.refetch();
    },
  };
}

export default useNotifications;
