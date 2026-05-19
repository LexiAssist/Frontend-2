import { useMutation, useQuery } from '@tanstack/react-query';
import { aiApi, audioApi } from '@/services/api';

// Hook for AI Chat
export function useAIChat() {
  return useMutation({
    mutationFn: ({ 
      query, 
      userId, 
      options 
    }: { 
      query: string; 
      userId: string; 
      options?: {
        conversationId?: string;
        materialId?: string;
        contextChunks?: string[];
      };
    }) => aiApi.chat(query, userId, {
      conversationId: options?.conversationId,
      materialId: options?.materialId,
      contextChunks: options?.contextChunks,
    }),
  });
}

// Hook for loading previous conversation (Requirement 17.4)
export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => conversationId ? aiApi.getConversation(conversationId) : null,
    enabled: !!conversationId,
  });
}

// Hook for generating summaries
export function useGenerateSummary() {
  return useMutation({
    mutationFn: ({ 
      content, 
      userId, 
      options 
    }: { 
      content: string; 
      userId: string; 
      options?: Parameters<typeof aiApi.generateSummary>[2];
    }) => aiApi.generateSummary(content, userId, options),
  });
}

// Hook for retrieving context (RAG)
export function useRetrieveContext() {
  return useMutation({
    mutationFn: ({ 
      query, 
      userId, 
      topK 
    }: { 
      query: string; 
      userId: string; 
      topK?: number;
    }) => aiApi.retrieveContext(query, userId, topK),
  });
}

// Hook for fetching supported TTS languages (Requirement 18.6)
export function useTTSLanguages() {
  return useQuery({
    queryKey: ['tts-languages'],
    queryFn: () => audioApi.getLanguages(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
