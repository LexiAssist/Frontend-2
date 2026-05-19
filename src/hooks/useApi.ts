'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { http, aiHttp } from '@/services/http';


// Generic hook for GET requests
export function useApiQuery<T>(
  key: string[],
  url: string,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: () => http.get<T>(url),
    ...options,
  });
}

// Generic hook for POST requests
export function useApiMutation<T, TData = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<T, Error, TData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<T, Error, TData>({
    mutationFn: (data) => http.post<T>(url, data),
    ...options,
  });
}

// Generic hook for PUT requests
export function useApiPut<T, TData = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<T, Error, TData>, 'mutationFn'>
) {
  return useMutation<T, Error, TData>({
    mutationFn: (data) => http.put<T>(url, data),
    ...options,
  });
}

// Generic hook for DELETE requests
export function useApiDelete<T>(
  url: string,
  options?: Omit<UseMutationOptions<T, Error, string>, 'mutationFn'>
) {
  return useMutation<T, Error, string>({
    mutationFn: (id) => http.delete<T>(`${url}/${id}`),
    ...options,
  });
}

// AI-specific hook for AI operations
export function useAiMutation<T, TData = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<T, Error, TData>, 'mutationFn'>
) {
  return useMutation<T, Error, TData>({
    mutationFn: (data) => aiHttp.post<T>(endpoint, data),
    ...options,
  });
}

// Optimistic update helper
export function useOptimisticMutation<T, TData = unknown>(
  url: string,
  queryKey: string[],
  updateFn: (oldData: T | undefined, newData: TData) => T | undefined
) {
  const queryClient = useQueryClient();

  return useMutation<T, Error, TData, { previousData: T | undefined }>({
    mutationFn: (data) => http.post<T>(url, data),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<T>(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<T>(queryKey, (old) => updateFn(old, newData));

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
