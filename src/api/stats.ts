import apiClient from "./client";

export interface StatTotals {
  categories: number;
  flashcards: number;
  quizzes: number;
  trueFalseSets: number;
  studyGuides: number;
}

export interface CategoryBreakdownItem {
  id: string;
  title: string;
  flashcards: number;
  quizzes: number;
  trueFalseSets: number;
  studyGuides: number;
  total: number;
  avgScore: number | null;
}

export interface RecentAttempt {
  type: "quiz" | "true_false";
  score: number;
  total: number;
  completedAt: string;
  categoryTitle: string | null;
}

export interface AttemptStats {
  totalAttempts: number;
  totalFlashcardSessions: number;
  avgScore: number;
  currentStreak: number;
  recentAttempts: RecentAttempt[];
  avgScoreByCategory: Record<string, number>;
}

export interface UserStats {
  totals: StatTotals;
  categoryBreakdown: CategoryBreakdownItem[];
  mostActive: { id: string; title: string } | null;
  attemptStats: AttemptStats;
}

export const statsApi = {
  getStats: (): Promise<UserStats> =>
    apiClient.get("/stats").then((r) => r.data),
};
