import apiClient from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuizSurvivalQuestion {
  type: "quiz";
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string | null;
}

export interface TFSurvivalQuestion {
  type: "true-false";
  id: string;
  statement: string;
  is_true: boolean;
  explanation?: string | null;
}

export type SurvivalQuestion = QuizSurvivalQuestion | TFSurvivalQuestion;

export interface SurvivalPoolResponse {
  questions: SurvivalQuestion[];
  total: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const gamesApi = {
  getSurvivalPool: async (params?: {
    categoryId?: string;
    limit?: number;
  }): Promise<SurvivalPoolResponse> => {
    const response = await apiClient.get("/games/survival/pool", { params });
    return response.data;
  },
};
