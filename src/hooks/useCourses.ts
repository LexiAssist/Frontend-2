import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/services/api';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Keys for query caching
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: { limit?: number; offset?: number }) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

// Hook to fetch all courses
export function useCourses(limit = 20, offset = 0) {
  return useQuery({
    queryKey: courseKeys.list({ limit, offset }),
    queryFn: () => courseApi.getAll(limit, offset),
  });
}

// Hook to fetch a single course
export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseApi.getById(id),
    enabled: !!id,
  });
}

// Hook to create a course
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success('Course created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create course');
    },
  });
}

// Hook to update a course
export function useUpdateCourse(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof courseApi.update>[1]) => 
      courseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success('Course updated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update course');
    },
  });
}

// Hook to delete a course
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success('Course deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete course');
    },
  });
}
