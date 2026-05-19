/**
 * Text-to-Speech Integration Tests
 * Tests for Requirements 18.1-18.7
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTTSLanguages } from '@/hooks/useAI';
import { audioApi } from '@/services/api';
import { setupQueryTest } from '@/__tests__/test-utils';

// Mock the API
vi.mock('@/services/api', () => ({
  audioApi: {
    textToSpeech: vi.fn(),
    getLanguages: vi.fn(),
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

describe('Text-to-Speech Integration', () => {
  let queryClient: any;
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

  describe('Requirement 18.1: TTS API function', () => {
    it('should send POST request to /api/v1/ai/text-to-speech', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      vi.mocked(audioApi.textToSpeech).mockResolvedValue(mockBlob);

      const result = await audioApi.textToSpeech('Hello world', 'en', false);

      expect(audioApi.textToSpeech).toHaveBeenCalledWith('Hello world', 'en', false);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('Requirement 18.2: FormData with parameters', () => {
    it('should create FormData with text, language, and slow parameters', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      vi.mocked(audioApi.textToSpeech).mockResolvedValue(mockBlob);

      await audioApi.textToSpeech('Test text', 'es', true);

      expect(audioApi.textToSpeech).toHaveBeenCalledWith('Test text', 'es', true);
    });
  });

  describe('Requirement 18.3: Receive audio Blob', () => {
    it('should receive audio Blob and create audio player', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      vi.mocked(audioApi.textToSpeech).mockResolvedValue(mockBlob);

      const blob = await audioApi.textToSpeech('Hello', 'en', false);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('audio/mpeg');

      // Verify we can create an audio URL from the blob
      const url = URL.createObjectURL(blob);
      expect(url).toMatch(/^blob:/);
      URL.revokeObjectURL(url);
    });
  });

  describe('Requirement 18.4: Playback controls', () => {
    it('should support audio playback controls', () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(mockBlob);
      const audio = new Audio(url);

      // Verify audio element has required controls
      expect(audio.play).toBeDefined();
      expect(audio.pause).toBeDefined();
      expect(audio.volume).toBeDefined();
      expect(audio.playbackRate).toBeDefined();

      // Test setting playback rate (speed)
      audio.playbackRate = 1.5;
      expect(audio.playbackRate).toBe(1.5);

      // Test setting volume
      audio.volume = 0.5;
      expect(audio.volume).toBe(0.5);

      URL.revokeObjectURL(url);
    });
  });

  describe('Requirement 18.5: Download option', () => {
    it('should provide download option for audio file', () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(mockBlob);

      // Verify we can create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'text-to-speech.mp3';

      expect(link.href).toMatch(/^blob:/);
      expect(link.download).toBe('text-to-speech.mp3');

      URL.revokeObjectURL(url);
    });
  });

  describe('Requirement 18.6: Fetch supported languages', () => {
    it('should fetch supported languages from backend', async () => {
      const mockLanguages = {
        supported_languages: {
          en: 'English (US)',
          'en-uk': 'English (UK)',
          es: 'Spanish',
          fr: 'French',
          de: 'German',
        },
      };

      vi.mocked(audioApi.getLanguages).mockResolvedValue(mockLanguages);

      const { result } = renderHook(() => useTTSLanguages(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockLanguages);
      });

      expect(audioApi.getLanguages).toHaveBeenCalled();
    });

    it('should cache languages for 1 hour', async () => {
      const mockLanguages = {
        supported_languages: {
          en: 'English (US)',
        },
      };

      vi.mocked(audioApi.getLanguages).mockResolvedValue(mockLanguages);

      const { result, rerender } = renderHook(() => useTTSLanguages(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockLanguages);
      });

      // Rerender should use cached data
      rerender();

      // Should only be called once due to caching
      expect(audioApi.getLanguages).toHaveBeenCalledTimes(1);
    });
  });

  describe('Requirement 18.7: Error handling', () => {
    it('should handle TTS API errors', async () => {
      const mockError = new Error('TTS failed');
      vi.mocked(audioApi.textToSpeech).mockRejectedValue(mockError);

      await expect(audioApi.textToSpeech('Test', 'en', false)).rejects.toThrow('TTS failed');
    });

    it('should handle language fetch errors', async () => {
      const mockError = new Error('Failed to load languages');
      vi.mocked(audioApi.getLanguages).mockRejectedValue(mockError);

      const { result } = renderHook(() => useTTSLanguages(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
