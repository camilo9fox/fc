import apiClient from "./client";

export interface RecordQuizAttemptRequest {
  quiz_id?: string;
  category_id?: string;
  score: number;
  total_questions: number;
}

export interface RecordTrueFalseAttemptRequest {
  set_id?: string;
  category_id?: string;
  score: number;
  total_questions: number;
}

export interface RecordFlashcardSessionRequest {
  category_id?: string;
  cards_known: number;
  cards_unknown: number;
  total_cards: number;
}

export interface DailyActivity {
  date: string;
  quizzes: number;
  trueFalse: number;
  flashcards: number;
}

export interface DailyScore {
  date: string;
  avgScore: number | null;
}

export interface ChartData {
  activityByDay: DailyActivity[];
  scoreByDay: DailyScore[];
}

export type AttemptType = "quiz" | "true-false" | "flashcards";

export interface HistoryItem {
  id: string;
  type: AttemptType;
  categoryId: string | null;
  categoryTitle: string | null;
  score: number;
  total: number;
  pct: number;
  completedAt: string;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface HistoryFilters {
  type?: AttemptType;
  categoryId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const attemptsApi = {
  recordQuiz: (data: RecordQuizAttemptRequest): Promise<void> =>
    apiClient.post("/attempts/quiz", data).then(() => undefined),

  recordTrueFalse: (data: RecordTrueFalseAttemptRequest): Promise<void> =>
    apiClient.post("/attempts/true-false", data).then(() => undefined),

  recordFlashcards: (data: RecordFlashcardSessionRequest): Promise<void> =>
    apiClient.post("/attempts/flashcards", data).then(() => undefined),

  getChartData: (): Promise<ChartData> =>
    apiClient.get("/attempts/chart-data").then((r) => r.data),

  getHistory: (filters: HistoryFilters = {}): Promise<HistoryResponse> =>
    apiClient.get("/attempts/history", { params: filters }).then((r) => r.data),
};
