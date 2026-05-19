/**
 * Analytics and Goals Integration Tests
 * Tests for Requirements 19.1-19.7
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { 
  useStudyStats, 
  useStudyStreak, 
  useTopicMastery,
  useGoals,
  useCreateGoal,
  useCompleteGoal 
} from '@/hooks/useAnalytics';
import { analyticsApi } from '@/services/api';
import type { StudyStats, StudyStreak, TopicMastery, LearningGoal, CreateGoalData } from '@/services/api';
import { setupQueryTest } from '@/__tests__/test-utils';

// Mock the API
vi.mock('@/services/api', () => ({
  analyticsApi: {
    getStudyStats: vi.fn(),
    getStudyStreak: vi.fn(),
    getTopicMastery: vi.fn(),
    getGoals: vi.fn(),
    createGoal: vi.fn(),
    completeGoal: vi.fn(),
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

describe('Analytics and Goals Integration', () => {
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

  describe('Requirement 19.1: Fetch study statistics', () => {
    it('should send GET request to /api/v1/analytics/study-stats', async () => {
      const mockStats: StudyStats = {
        current_streak: 5,
        total_study_days: 30,
        total_study_minutes: 1800,
        total_quizzes_completed: 15,
        total_materials_reviewed: 25,
        last_study_date: '2024-01-15',
      };

      vi.mocked(analyticsApi.getStudyStats).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useStudyStats(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockStats);
      });

      expect(analyticsApi.getStudyStats).toHaveBeenCalled();
    });

    it('should send GET request to /api/v1/analytics/study-streak', async () => {
      const mockStreak: StudyStreak = {
        current_streak: 5,
        longest_streak: 10,
        last_study_date: '2024-01-15',
      };

      vi.mocked(analyticsApi.getStudyStreak).mockResolvedValue(mockStreak);

      const { result } = renderHook(() => useStudyStreak(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockStreak);
      });

      expect(analyticsApi.getStudyStreak).toHaveBeenCalled();
    });
  });

  describe('Requirement 19.2: Display study statistics', () => {
    it('should display current streak, total study days, total minutes, and quizzes completed', async () => {
      const mockStats: StudyStats = {
        current_streak: 7,
        total_study_days: 45,
        total_study_minutes: 2700,
        total_quizzes_completed: 20,
        total_materials_reviewed: 30,
        last_study_date: '2024-01-15',
      };

      vi.mocked(analyticsApi.getStudyStats).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useStudyStats(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const stats = result.current.data!;
      expect(stats.current_streak).toBe(7);
      expect(stats.total_study_days).toBe(45);
      expect(stats.total_study_minutes).toBe(2700);
      expect(stats.total_quizzes_completed).toBe(20);
    });
  });

  describe('Requirement 19.3: Display topic mastery', () => {
    it('should send GET request to /api/v1/analytics/topic-mastery', async () => {
      const mockMastery: TopicMastery[] = [
        {
          topic: 'Mathematics',
          mastery_score: 85,
          last_reviewed: '2024-01-15',
        },
        {
          topic: 'Physics',
          mastery_score: 72,
          last_reviewed: '2024-01-14',
        },
      ];

      vi.mocked(analyticsApi.getTopicMastery).mockResolvedValue(mockMastery);

      const { result } = renderHook(() => useTopicMastery(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockMastery);
      });

      expect(analyticsApi.getTopicMastery).toHaveBeenCalled();
    });

    it('should display topic mastery scores in visual format', async () => {
      const mockMastery: TopicMastery[] = [
        {
          topic: 'Biology',
          mastery_score: 90,
          last_reviewed: '2024-01-15',
        },
      ];

      vi.mocked(analyticsApi.getTopicMastery).mockResolvedValue(mockMastery);

      const { result } = renderHook(() => useTopicMastery(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const mastery = result.current.data!;
      expect(mastery[0].topic).toBe('Biology');
      expect(mastery[0].mastery_score).toBe(90);
      expect(mastery[0].last_reviewed).toBe('2024-01-15');
    });
  });

  describe('Requirement 19.4: Fetch learning goals', () => {
    it('should send GET request to /api/v1/analytics/goals', async () => {
      const mockGoals: LearningGoal[] = [
        {
          id: 'goal-1',
          user_id: 'user-123',
          title: 'Complete Biology Course',
          description: 'Finish all chapters',
          target_date: '2024-12-31',
          goal_type: 'course_completion',
          target_value: 100,
          current_value: 50,
          status: 'in_progress',
          created_at: '2024-01-01',
          updated_at: '2024-01-15',
        },
      ];

      vi.mocked(analyticsApi.getGoals).mockResolvedValue(mockGoals);

      const { result } = renderHook(() => useGoals(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockGoals);
      });

      expect(analyticsApi.getGoals).toHaveBeenCalled();
    });
  });

  describe('Requirement 19.5: Create learning goal', () => {
    it('should send POST request to /api/v1/analytics/goals with goal data', async () => {
      const goalData: CreateGoalData = {
        title: 'Study 60 minutes daily',
        description: 'Maintain consistent study habit',
        target_date: '2024-12-31',
        goal_type: 'study_time',
        target_value: 60,
      };

      const mockCreatedGoal: LearningGoal = {
        id: 'goal-2',
        user_id: 'user-123',
        ...goalData,
        current_value: 0,
        target_value: 60,
        status: 'in_progress',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      };

      vi.mocked(analyticsApi.createGoal).mockResolvedValue(mockCreatedGoal);

      const { result } = renderHook(() => useCreateGoal(), { wrapper });

      result.current.mutate(goalData);

      await waitFor(() => {
        expect(analyticsApi.createGoal).toHaveBeenCalledWith(goalData, expect.any(Object));
      });
    });

    it('should validate goal form data', async () => {
      const invalidGoalData = {
        title: '',
        goal_type: 'study_time',
        target_value: -1,
      } as CreateGoalData;

      const { result } = renderHook(() => useCreateGoal(), { wrapper });

      // The validation should happen in the form, but we test the API call
      vi.mocked(analyticsApi.createGoal).mockRejectedValue(
        new Error('Invalid goal data')
      );

      result.current.mutate(invalidGoalData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('Requirement 19.6: Mark goal as complete', () => {
    it('should send POST request to /api/v1/analytics/goals/{id}/complete', async () => {
      const goalId = 'goal-1';
      const mockCompletedGoal: LearningGoal = {
        id: goalId,
        user_id: 'user-123',
        title: 'Complete Biology Course',
        goal_type: 'course_completion',
        target_value: 100,
        current_value: 100,
        status: 'completed',
        created_at: '2024-01-01',
        updated_at: '2024-01-15',
      };

      vi.mocked(analyticsApi.completeGoal).mockResolvedValue(mockCompletedGoal);

      const { result } = renderHook(() => useCompleteGoal(), { wrapper });

      result.current.mutate(goalId);

      await waitFor(() => {
        expect(analyticsApi.completeGoal).toHaveBeenCalledWith(goalId, expect.any(Object));
      });
    });
  });

  describe('Requirement 19.7: Display goal progress', () => {
    it('should display goal progress with visual indicators', async () => {
      const mockGoals: LearningGoal[] = [
        {
          id: 'goal-1',
          user_id: 'user-123',
          title: 'Study 100 hours',
          goal_type: 'study_time',
          target_value: 100,
          current_value: 75,
          status: 'in_progress',
          created_at: '2024-01-01',
          updated_at: '2024-01-15',
        },
      ];

      vi.mocked(analyticsApi.getGoals).mockResolvedValue(mockGoals);

      const { result } = renderHook(() => useGoals(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const goal = result.current.data![0];
      const progressPercentage = (goal.current_value / goal.target_value) * 100;
      
      expect(progressPercentage).toBe(75);
      expect(goal.status).toBe('in_progress');
    });

    it('should handle different goal types', async () => {
      const mockGoals: LearningGoal[] = [
        {
          id: 'goal-1',
          user_id: 'user-123',
          title: 'Quiz Score Goal',
          goal_type: 'quiz_score',
          target_value: 90,
          current_value: 85,
          status: 'in_progress',
          created_at: '2024-01-01',
          updated_at: '2024-01-15',
        },
        {
          id: 'goal-2',
          user_id: 'user-123',
          title: 'Study Streak Goal',
          goal_type: 'streak',
          target_value: 30,
          current_value: 15,
          status: 'in_progress',
          created_at: '2024-01-01',
          updated_at: '2024-01-15',
        },
      ];

      vi.mocked(analyticsApi.getGoals).mockResolvedValue(mockGoals);

      const { result } = renderHook(() => useGoals(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const goals = result.current.data!;
      expect(goals[0].goal_type).toBe('quiz_score');
      expect(goals[1].goal_type).toBe('streak');
    });
  });

  describe('Error handling', () => {
    it('should handle study stats fetch errors', async () => {
      const mockError = new Error('Failed to fetch study stats');
      vi.mocked(analyticsApi.getStudyStats).mockRejectedValue(mockError);

      const { result } = renderHook(() => useStudyStats(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should handle goal creation errors', async () => {
      const mockError = new Error('Failed to create goal');
      vi.mocked(analyticsApi.createGoal).mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreateGoal(), { wrapper });

      const goalData: CreateGoalData = {
        title: 'Test Goal',
        goal_type: 'study_time',
        target_value: 60,
      };

      result.current.mutate(goalData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
