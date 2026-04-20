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

/** Question returned by the AI generate endpoint (not yet saved) */
export interface DraftQuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  order_index: number;
}

export interface GenerateQuizResponse {
  questions: DraftQuizQuestion[];
}

export interface QuizGenerationJob {
  id: string;
  type: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: {
    stage: string;
    percent: number;
  };
  metadata?: {
    title?: string;
    quantity?: number;
    fileName?: string | null;
    inputMode?: string;
  };
  result: null | { questions: DraftQuizQuestion[] };
  error: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
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

  /** Update a single question in a saved quiz */
  updateQuestion: async (
    quizId: string,
    questionId: string,
    data: Partial<CreateQuizQuestionRequest>,
  ): Promise<QuizQuestion> => {
    const response = await apiClient.patch(
      `/quizzes/${quizId}/questions/${questionId}`,
      data,
    );
    return response.data;
  },

  /** Generate quiz questions from a document or text using AI (returns draft, not saved) */
  generate: async (formData: FormData): Promise<GenerateQuizResponse> => {
    const response = await apiClient.post("/quizzes/generate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /** Start async quiz generation — returns a job immediately (202) */
  startGenerateQuizJob: async (
    formData: FormData,
  ): Promise<QuizGenerationJob> => {
    const response = await apiClient.post("/quizzes/generate-async", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /** Poll the status of an async quiz generation job */
  getGenerationJob: async (jobId: string): Promise<QuizGenerationJob> => {
    const response = await apiClient.get(`/quizzes/generation-jobs/${jobId}`);
    return response.data;
  },
};
