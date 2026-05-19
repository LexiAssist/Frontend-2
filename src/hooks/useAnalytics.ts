import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Keys for query caching
export const analyticsKeys = {
  all: ['analytics'] as const,
  stats: () => [...analyticsKeys.all, 'stats'] as const,
  streak: () => [...analyticsKeys.all, 'streak'] as const,
  mastery: () => [...analyticsKeys.all, 'mastery'] as const,
  goals: () => [...analyticsKeys.all, 'goals'] as const,
};

// Hook to fetch study stats
export function useStudyStats() {
  return useQuery({
    queryKey: analyticsKeys.stats(),
    queryFn: () => analyticsApi.getStudyStats(),
  });
}

// Hook to fetch study streak
export function useStudyStreak() {
  return useQuery({
    queryKey: analyticsKeys.streak(),
    queryFn: () => analyticsApi.getStudyStreak(),
  });
}

// Hook to fetch topic mastery
export function useTopicMastery() {
  return useQuery({
    queryKey: analyticsKeys.mastery(),
    queryFn: () => analyticsApi.getTopicMastery(),
  });
}

// Hook to record a study session
export function useRecordStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyticsApi.recordStudySession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.streak() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to record study session');
    },
  });
}

// Hook to fetch goals
export function useGoals() {
  return useQuery({
    queryKey: analyticsKeys.goals(),
    queryFn: () => analyticsApi.getGoals(),
  });
}

// Hook to create goal
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyticsApi.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.goals() });
      toast.success('Learning goal created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create goal');
    },
  });
}

// Hook to complete goal
export function useCompleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analyticsApi.completeGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.goals() });
      toast.success('Goal marked as completed!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to complete goal');
    },
  });
}
