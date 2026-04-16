import apiClient from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  /** All alternatives, including the correct one */
  options: string[];
  correct_answer: string;
  explanation?: string | null;
  order_index: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  category_id: string;
  category?: {
    id: string;
    title: string;
    description?: string;
  };
  title: string;
  description?: string | null;
  questions?: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

export interface CreateQuizQuestionRequest {
  question: string;
  /** All alternatives, including the correct answer */
  options: string[];
  correct_answer: string;
  explanation?: string;
  order_index?: number;
}

export interface CreateQuizRequest {
  title: string;
  category_id: string;
  description?: string;
  questions: CreateQuizQuestionRequest[];
}

export interface QuizzesResponse {
  quizzes: Quiz[];
  pagination: {
    limit: number;
    offset: number;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const quizApi = {
  /** Create a new quiz with its questions */
  create: async (data: CreateQuizRequest): Promise<Quiz> => {
    const response = await apiClient.post("/quizzes", data);
    return response.data;
  },

  /** Get all quizzes for the authenticated user */
  getAll: async (params?: {
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<QuizzesResponse> => {
    const response = await apiClient.get("/quizzes", { params });
    return response.data;
  },

  /** Get a single quiz with its questions */
  getById: async (id: string): Promise<Quiz> => {
    const response = await apiClient.get(`/quizzes/${id}`);
    return response.data;
  },

  /** Update quiz metadata (title, description) */
  update: async (
    id: string,
    data: Partial<Pick<CreateQuizRequest, "title" | "description">>,
  ): Promise<Quiz> => {
    const response = await apiClient.put(`/quizzes/${id}`, data);
    return response.data;
  },

  /** Delete a quiz and all its questions */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${id}`);
  },

  /** Add a question to an existing quiz */
  addQuestion: async (
    quizId: string,
    question: CreateQuizQuestionRequest,
  ): Promise<QuizQuestion> => {
    const response = await apiClient.post(
      `/quizzes/${quizId}/questions`,
      question,
    );
    return response.data;
  },

  /** Delete a single question from a quiz */
  deleteQuestion: async (quizId: string, questionId: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${quizId}/questions/${questionId}`);
  },

  /** Generate a quiz from a document or text using AI */
  generate: async (formData: FormData): Promise<Quiz> => {
    const response = await apiClient.post("/quizzes/generate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
