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

export const attemptsApi = {
  recordQuiz: (data: RecordQuizAttemptRequest): Promise<void> =>
    apiClient.post("/attempts/quiz", data).then(() => undefined),

  recordTrueFalse: (data: RecordTrueFalseAttemptRequest): Promise<void> =>
    apiClient.post("/attempts/true-false", data).then(() => undefined),

  recordFlashcards: (data: RecordFlashcardSessionRequest): Promise<void> =>
    apiClient.post("/attempts/flashcards", data).then(() => undefined),
};
