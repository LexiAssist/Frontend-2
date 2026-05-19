// User Types - Aligned with backend
export interface User {
  id: string;
  email: string;
  // Backend uses first_name/last_name, frontend displays as name
  first_name?: string;
  last_name?: string;
  name?: string; // Computed from first_name + last_name
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  school?: string;
  department?: string;
  academic_level?: 'undergraduate' | 'postgraduate' | 'doctoral' | 'staff' | 'graduate';
  level?: string; // Alias for academic_level
  timezone?: string;
  email_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Frontend alias
  updatedAt?: string; // Frontend alias
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Will be split into first/last name
  school?: string;
  department?: string;
  academic_level?: string;
  level?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: string;
  message?: string;
}

// Course Types - From backend
export interface Course {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  color?: string;
  semester?: string;
  year?: number;
  created_at: string;
  updated_at: string;
  // Frontend aliases
  createdAt?: string;
  updatedAt?: string;
}

// Study Material Types
export interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  content?: string;
  content_type: string;
  file_size: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  course_id?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  // Frontend aliases
  createdAt?: string;
  updatedAt?: string;
  subject?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// Quiz Types - Aligned with backend
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  course_id?: string;
  user_id?: string;
  time_limit_minutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
  // Frontend aliases
  createdAt?: string;
  subject?: string;
  sourceMaterial?: string;
  createdBy?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id?: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: QuizOption[];
  correct_answer?: string;
  explanation?: string;
  points: number;
  // Frontend aliases
  question?: string;
  type?: 'multiple_choice' | 'true_false' | 'short_answer';
}

export interface QuizOption {
  text: string;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  total_points?: number;
}

export interface QuizAnswer {
  question_id: string;
  answer: string;
  time_taken_seconds?: number;
}

export interface QuizResult {
  attempt_id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_points: number;
  correct_answers: number;
  total_questions: number;
  feedback?: Record<string, string>;
}

// Flashcard Types - Aligned with backend
export interface Flashcard {
  id: string;
  deck_id?: string;
  front: string;
  back: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  created_at?: string;
  // Frontend aliases
  createdAt?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description?: string;
  user_id?: string;
  course_id?: string;
  cards?: Flashcard[];
  created_at: string;
  updated_at: string;
  // Frontend aliases
  createdAt?: string;
  updatedAt?: string;
}

// Alias for backward compatibility
export interface StudySet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  subject?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// AI Types
export interface AIRequest {
  prompt: string;
  context?: string;
  type: 'explain' | 'summarize' | 'quiz' | 'chat' | 'rewrite' | 'flashcards';
  options?: {
    summaryLength?: 'short' | 'medium' | 'detailed';
    rewriteMode?: 'grammar' | 'academic' | 'simple' | 'creative';
    questionCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

export interface AIResponse {
  content: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Text to Speech Types
export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSItem {
  id: string;
  text: string;
  audioUrl?: string;
  createdAt: string;
}

// Summary Types
export interface Summary {
  id: string;
  title: string;
  originalText: string;
  summary: string;
  originalLength: number;
  summaryLength: number;
  lengthType: 'short' | 'medium' | 'detailed';
  createdAt: string;
}

// Analytics Types - Aligned with backend
export interface StudyStats {
  current_streak: number;
  total_study_days: number;
  total_study_minutes: number;
  total_quizzes_completed: number;
  total_materials_reviewed: number;
  last_study_date: string;
  // Frontend aliases
  quizzesTaken?: number;
  averageScore?: number;
  streakDays?: number;
}

export interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  last_study_date: string;
}

export interface TopicMastery {
  topic: string;
  mastery_score: number;
  last_reviewed: string;
}

export interface StudySession {
  id?: string;
  session_date: string;
  duration_minutes: number;
  quizzes_completed?: number;
  materials_reviewed?: number;
  created_at?: string;
}

export interface UserAnalytics {
  totalStudyTime: number; // in minutes
  quizzesTaken: number;
  averageScore: number;
  streakDays: number;
  subjectsStudied: string[];
  weeklyProgress: WeeklyProgress[];
  flashcardsReviewed: number;
  summariesCreated: number;
}

export interface WeeklyProgress {
  date: string;
  studyTime: number;
  quizzesCompleted: number;
  averageScore: number;
  flashcardsReviewed: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// UI Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  submenu?: NavItem[];
}

// Notification Types
export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  email_frequency: 'immediate' | 'daily_digest' | 'weekly_digest';
  quiet_hours_start: number;
  quiet_hours_end: number;
  timezone: string;
  notify_on_quiz_completion: boolean;
  notify_on_streak_achievement: boolean;
  notify_on_goal_completion: boolean;
  notify_on_material_processed: boolean;
  notify_on_study_reminder: boolean;
}

// Learning Goal Types
export interface LearningGoal {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  goal_type: 'course_completion' | 'quiz_score' | 'study_time' | 'streak';
  course_id?: string;
  target_value?: number;
  current_value?: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}
