import apiClient from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrueFalseQuestion {
  id: string;
  set_id: string;
  /** The statement the user must judge as true or false */
  statement: string;
  is_true: boolean;
  explanation?: string | null;
  order_index: number;
  created_at: string;
}

export interface TrueFalseSet {
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
  questions?: TrueFalseQuestion[];
  created_at: string;
  updated_at: string;
}

export interface CreateTrueFalseQuestionRequest {
  statement: string;
  is_true: boolean;
  explanation?: string;
  order_index?: number;
}

/** Statement returned by the AI generate endpoint (not yet saved) */
export interface DraftTrueFalseQuestion {
  statement: string;
  is_true: boolean;
  explanation: string | null;
  order_index: number;
}

export interface GenerateTrueFalseResponse {
  questions: DraftTrueFalseQuestion[];
}

export interface TrueFalseGenerationJob {
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
  result: null | { statements: DraftTrueFalseQuestion[] };
  error: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CreateTrueFalseSetRequest {
  title: string;
  category_id: string;
  description?: string;
  questions: CreateTrueFalseQuestionRequest[];
}

export interface TrueFalseSetsResponse {
  sets: TrueFalseSet[];
  pagination: {
    limit: number;
    offset: number;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const trueFalseApi = {
  /** Create a new true/false set with its statements */
  create: async (data: CreateTrueFalseSetRequest): Promise<TrueFalseSet> => {
    const response = await apiClient.post("/true-false", data);
    return response.data;
  },

  /** Get all true/false sets for the authenticated user */
  getAll: async (params?: {
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<TrueFalseSetsResponse> => {
    const response = await apiClient.get("/true-false", { params });
    return response.data;
  },

  /** Get a single set with its questions */
  getById: async (id: string): Promise<TrueFalseSet> => {
    const response = await apiClient.get(`/true-false/${id}`);
    return response.data;
  },

  /** Update set metadata (title, description) */
  update: async (
    id: string,
    data: Partial<Pick<CreateTrueFalseSetRequest, "title" | "description">>,
  ): Promise<TrueFalseSet> => {
    const response = await apiClient.put(`/true-false/${id}`, data);
    return response.data;
  },

  /** Delete a set and all its questions */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/true-false/${id}`);
  },

  /** Add a question to an existing set */
  addQuestion: async (
    setId: string,
    question: CreateTrueFalseQuestionRequest,
  ): Promise<TrueFalseQuestion> => {
    const response = await apiClient.post(
      `/true-false/${setId}/questions`,
      question,
    );
    return response.data;
  },

  /** Delete a single question from a set */
  deleteQuestion: async (setId: string, questionId: string): Promise<void> => {
    await apiClient.delete(`/true-false/${setId}/questions/${questionId}`);
  },

  /** Generate true/false statements from a document or text using AI (returns draft, not saved) */
  generate: async (formData: FormData): Promise<GenerateTrueFalseResponse> => {
    const response = await apiClient.post("/true-false/generate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /** Start async V/F generation — returns a job immediately (202) */
  startGenerateJob: async (
    formData: FormData,
  ): Promise<TrueFalseGenerationJob> => {
    const response = await apiClient.post(
      "/true-false/generate-async",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  /** Poll the status of an async V/F generation job */
  getGenerationJob: async (jobId: string): Promise<TrueFalseGenerationJob> => {
    const response = await apiClient.get(
      `/true-false/generation-jobs/${jobId}`,
    );
    return response.data;
  },
};
