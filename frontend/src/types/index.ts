/**
 * FlashLearn AI Shared TypeScript Definitions.
 * Strict typing across frontend components and API contracts.
 */

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  xp_points: number;
  level: number;
  streak_days: number;
  created_at: string;
}

export interface KeyConcept {
  id?: string;
  order_index: number;
  title: string;
  summary: string;
  example?: string;
}

export interface Flashcard {
  id?: string;
  front: string;
  back: string;
  hint?: string;
  is_mastered: boolean;
  times_reviewed: number;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

export interface CourseDetail {
  id: string;
  title: string;
  created_at: string;
  is_completed?: boolean;
  xp_earned?: number;
  quiz_score?: number;
  completed_at?: string;
  key_concepts: KeyConcept[];
  flashcards: Flashcard[];
  quiz_questions: QuizQuestion[];
}

export interface CourseSummary {
  id: string;
  title: string;
  created_at: string;
  is_completed: boolean;
  xp_earned: number;
  quiz_score?: number;
  completed_at?: string;
  concepts_count: number;
  flashcards_count: number;
  quiz_questions_count: number;
}

export interface CourseCompletionResult {
  course_id: string;
  is_completed: boolean;
  xp_awarded: number;
  total_xp: number;
  level: number;
  message: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
