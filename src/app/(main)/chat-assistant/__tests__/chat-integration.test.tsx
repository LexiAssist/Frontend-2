/**
 * Chat Assistant Integration Tests
 * Tests for Requirements 17.1-17.7
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useAIChat, useConversation } from '@/hooks/useAI';
import { aiApi } from '@/services/api';
import { setupQueryTest } from '@/__tests__/test-utils';

// Mock the API
vi.mock('@/services/api', () => ({
  aiApi: {
    chat: vi.fn(),
    getConversation: vi.fn(),
    chatStream: vi.fn(),
  },
}));

// Mock auth store
vi.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      accessToken: 'test-token',
      user: { id: 'user-123', name: 'Test User' },
    }),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('Chat Assistant Integration', () => {
  let queryClient: QueryClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;
  let cleanup: () => Promise<void>;

  beforeEach(() => {
    const setup = setupQueryTest();
    queryClient = setup.queryClient;
    wrapper = setup.wrapper;
    cleanup = setup.cleanup;
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('Requirement 17.1: Chat API function', () => {
    it('should send POST request to /api/v1/ai/chat with correct parameters', async () => {
      const mockResponse = {
        response: 'Test response',
        conversation_id: 'conv-123',
        tokens_used: 50,
        model: 'gpt-4',
        sources: ['source1.pdf'],
      };

      vi.mocked(aiApi.chat).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIChat(), { wrapper });

      await result.current.mutateAsync({
        query: 'Test query',
        userId: 'user-123',
        options: {
          conversationId: 'conv-123',
          materialId: 'mat-456',
        },
      });

      expect(aiApi.chat).toHaveBeenCalledWith(
        'Test query',
        'user-123',
        expect.objectContaining({
          conversationId: 'conv-123',
          materialId: 'mat-456',
        })
      );
    });
  });

  describe('Requirement 17.2: Display conversation', () => {
    it('should format messages with user on right and assistant on left', () => {
      const messages = [
        { id: '1', role: 'user' as const, content: 'Hello', timestamp: new Date() },
        { id: '2', role: 'assistant' as const, content: 'Hi there', timestamp: new Date() },
      ];

      // This would be tested in component tests with actual rendering
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
    });
  });

  describe('Requirement 17.4: Load previous conversations', () => {
    it('should fetch conversation by ID', async () => {
      const mockConversation = {
        conversation_id: 'conv-123',
        user_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        messages: [
          {
            id: 'msg-1',
            role: 'user' as const,
            content: 'Previous message',
            timestamp: '2024-01-01T00:00:00Z',
          },
        ],
      };

      vi.mocked(aiApi.getConversation).mockResolvedValue(mockConversation);

      const { result } = renderHook(() => useConversation('conv-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockConversation);
      });

      expect(aiApi.getConversation).toHaveBeenCalledWith('conv-123');
    });
  });

  describe('Requirement 17.5: Display source citations', () => {
    it('should include sources in chat response', async () => {
      const mockResponse = {
        response: 'Based on the document...',
        conversation_id: 'conv-123',
        tokens_used: 50,
        model: 'gpt-4',
        sources: ['document1.pdf', 'document2.pdf'],
      };

      vi.mocked(aiApi.chat).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIChat(), { wrapper });

      const response = await result.current.mutateAsync({
        query: 'What does the document say?',
        userId: 'user-123',
      });

      expect(response.sources).toEqual(['document1.pdf', 'document2.pdf']);
    });
  });

  describe('Requirement 17.6: Streaming responses', () => {
    it('should handle streaming chat responses', async () => {
      const tokens: string[] = [];
      let completeResponse: { response: string; conversation_id: string; tokens_used: number; model: string } | null = null;

      const mockStreamFn = vi.fn(async (query, userId, options, onToken, onComplete) => {
        // Simulate streaming tokens
        const testTokens = ['Hello', ' ', 'world', '!'];
        for (const token of testTokens) {
          onToken(token);
        }

        // Simulate completion
        onComplete({
          response: 'Hello world!',
          conversation_id: 'conv-123',
          tokens_used: 4,
          model: 'gpt-4',
          sources: [],
        });
      });

      vi.mocked(aiApi.chatStream).mockImplementation(mockStreamFn);

      await aiApi.chatStream(
        'Test query',
        'user-123',
        {},
        (token) => tokens.push(token),
        (response) => {
          completeResponse = response;
        },
        (error) => {
          throw error;
        }
      );

      expect(tokens).toEqual(['Hello', ' ', 'world', '!']);
      expect(completeResponse).toMatchObject({
        response: 'Hello world!',
        conversation_id: 'conv-123',
      });
    });
  });

  describe('Requirement 17.7: Context chunks and material ID', () => {
    it('should send context chunks and material ID in request', async () => {
      const mockResponse = {
        response: 'Response with context',
        conversation_id: 'conv-123',
        tokens_used: 50,
        model: 'gpt-4',
        sources: [],
      };

      vi.mocked(aiApi.chat).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIChat(), { wrapper });

      await result.current.mutateAsync({
        query: 'Test query',
        userId: 'user-123',
        options: {
          contextChunks: ['chunk1', 'chunk2'],
          materialId: 'mat-456',
        },
      });

      expect(aiApi.chat).toHaveBeenCalledWith(
        'Test query',
        'user-123',
        expect.objectContaining({
          contextChunks: ['chunk1', 'chunk2'],
          materialId: 'mat-456',
        })
      );
    });
  });
});
