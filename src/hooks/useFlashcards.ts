import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashcardApi } from '@/services/api';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Keys for query caching
export const flashcardKeys = {
  all: ['flashcards'] as const,
  lists: () => [...flashcardKeys.all, 'list'] as const,
  list: (filters: { limit?: number; offset?: number }) => [...flashcardKeys.lists(), filters] as const,
  details: () => [...flashcardKeys.all, 'detail'] as const,
  detail: (id: string) => [...flashcardKeys.details(), id] as const,
  generated: () => [...flashcardKeys.all, 'generated'] as const,
};

// Hook to fetch all flashcard decks
export function useFlashcardDecks(limit = 20, offset = 0) {
  return useQuery({
    queryKey: flashcardKeys.list({ limit, offset }),
    queryFn: () => flashcardApi.getAllDecks(limit, offset),
  });
}

// Hook to fetch a single flashcard deck
export function useFlashcardDeck(id: string) {
  return useQuery({
    queryKey: flashcardKeys.detail(id),
    queryFn: () => flashcardApi.getDeckById(id),
    enabled: !!id,
  });
}

// Hook to create a flashcard deck
export function useCreateFlashcardDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: flashcardApi.createDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
      toast.success('Flashcard deck created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create flashcard deck');
    },
  });
}

// Hook to generate flashcards from content
export function useGenerateFlashcards() {
  return useMutation({
    mutationFn: ({ content, userId }: { content: string; userId: string }) =>
      flashcardApi.generateFromContent(content, userId),
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to generate flashcards');
    },
  });
}
