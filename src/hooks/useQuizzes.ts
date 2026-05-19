import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '@/services/api';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Keys for query caching
export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (filters: { limit?: number; offset?: number }) => [...quizKeys.lists(), filters] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
  attempts: () => [...quizKeys.all, 'attempt'] as const,
  attempt: (id: string) => [...quizKeys.attempts(), id] as const,
};

// Hook to fetch all quizzes
export function useQuizzes(limit = 20, offset = 0) {
  return useQuery({
    queryKey: quizKeys.list({ limit, offset }),
    queryFn: () => quizApi.getAll(limit, offset),
  });
}

// Hook to fetch a single quiz
export function useQuiz(id: string) {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => quizApi.getById(id),
    enabled: !!id,
  });
}

// Hook to create a quiz
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quizApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      toast.success('Quiz created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create quiz');
    },
  });
}

// Hook to generate a quiz from content
export function useGenerateQuiz() {
  return useMutation({
    mutationFn: ({ content, userId, quizType, numQuestions }: { 
      content: string; 
      userId: string;
      quizType?: 'multiple_choice' | 'theory';
      numQuestions?: number;
    }) =>
      quizApi.generateFromContent(content, userId, quizType, numQuestions),
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to generate quiz');
    },
  });
}

// Hook to start a quiz attempt
export function useStartQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quizApi.startAttempt,
    onSuccess: (data) => {
      queryClient.setQueryData(quizKeys.attempt(data.id), data);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to start quiz');
    },
  });
}

// Hook to submit an answer
export function useSubmitAnswer(attemptId: string) {
  return useMutation({
    mutationFn: (data: Parameters<typeof quizApi.submitAnswer>[1]) =>
      quizApi.submitAnswer(attemptId, data),
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to submit answer');
    },
  });
}

// Hook to complete a quiz attempt
export function useCompleteQuizAttempt() {
  return useMutation({
    mutationFn: quizApi.completeAttempt,
    onSuccess: (data) => {
      toast.success(`Quiz completed! Score: ${data.score}/${data.total_points}`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to complete quiz');
    },
  });
}
