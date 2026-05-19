/**
 * Hooks Exports
 * 
 * Centralized exports for custom React hooks
 */

// Auth hooks
export {
  useUser,
  useLogin,
  useRegister,
  useLogout,
  useAuth,
  useVerifyEmail,
  useResendVerification,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  useSessions,
  useRevokeSession,
  useLogoutAll,
  authKeys,
  sessionKeys,
} from './useAuth';

// Settings hooks
export { useSettings, type ProfileData, type PrivacySettings } from './useSettings';

// Notification hooks
export {
  useNotifications,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useReminders,
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
  useNotificationHistory,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useRegisterDevice,
  notificationKeys,
} from './useNotifications';

// Course hooks
export {
  useCourses,
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  courseKeys,
} from './useCourses';

// Flashcard hooks
export {
  useFlashcardDecks,
  useFlashcardDeck,
  useCreateFlashcardDeck,
  useGenerateFlashcards,
  flashcardKeys,
} from './useFlashcards';

// Quiz hooks
export {
  useQuizzes,
  useQuiz,
  useCreateQuiz,
  useGenerateQuiz,
  useStartQuizAttempt,
  useSubmitAnswer,
  useCompleteQuizAttempt,
  quizKeys,
} from './useQuizzes';

// Analytics hooks
export {
  useStudyStats,
  useStudyStreak,
  useTopicMastery,
  useRecordStudySession,
  useGoals,
  useCreateGoal,
  useCompleteGoal,
  analyticsKeys,
} from './useAnalytics';

// AI hooks
export {
  useAIChat,
  useConversation,
  useGenerateSummary,
  useRetrieveContext,
  useTTSLanguages,
} from './useAI';

// API hooks (generic)
export {
  useApiQuery,
  useApiMutation,
  useApiPut,
  useApiDelete,
  useAiMutation,
  useOptimisticMutation,
} from './useApi';

// Error handling and loading states
export { useErrorHandler } from './useErrorHandler';
export { useLoadingState, useUploadProgress } from './useLoadingState';

// Sync and WebSocket
export { useSync, syncKeys } from './useSync';
export { useWebSocket } from './useWebSocket';

// Mock mode
export { useMockMode } from './useMockMode';
