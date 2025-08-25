export type Topic = {
  id: string;
  name: string;
  description?: string;
};

export type Flashcard = {
  id: string;
  topicId: string;
  term: string;
  definition: string;
  lastReviewedAt?: string; // ISO
  easeFactor?: number; // for SM-2
  interval?: number; // days
  repetitions?: number;
  dueAt?: string; // ISO
};

export type Question = {
  id: string;
  topicId: string;
  prompt: string;
  options: string[];
  correct: number[]; // support multi-correct
  multiCorrect?: boolean;
  explanation: string;
  optionExplanations?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
};

export type UserProfile = {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
};

export type QuizResult = {
  id: string;
  userId: string;
  createdAt: string;
  questionId: string;
  correct: boolean;
  selected: number[];
  confidence: 'low' | 'medium' | 'high';
};

export type TopicMastery = {
  topicId: string;
  accuracy: number; // 0..1
  attempts: number;
};

export type StudyProgress = {
  userId: string;
  updatedAt: string;
  topicMastery: TopicMastery[];
  badges: string[];
  streakDays: number;
};

export type ExamSession = {
  id: string;
  userId: string;
  startedAt: string;
  durationMinutes: number;
  completedAt?: string;
  score?: number;
  breakdown?: { topicId: string; correct: number; total: number }[];
  passed?: boolean;
};