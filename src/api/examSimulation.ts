import apiClient from "./client";

export interface ExamSimulationTrueFalseQuestion {
  id?: string;
  simulation_id?: string;
  statement: string;
  is_true: boolean;
  explanation?: string | null;
  order_index: number;
}

export interface ExamSimulationDevelopmentQuestion {
  id?: string;
  simulation_id?: string;
  prompt: string;
  reference_answer?: string | null;
  evaluation_criteria?: string | null;
  max_points: number;
  order_index: number;
}

export interface ExamSimulationMultipleChoiceQuestion {
  id?: string;
  simulation_id?: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string | null;
  order_index: number;
}

export interface ExamSimulation {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description?: string | null;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    title: string;
    description?: string;
  } | null;
  trueFalseQuestions?: ExamSimulationTrueFalseQuestion[];
  multipleChoiceQuestions?: ExamSimulationMultipleChoiceQuestion[];
  developmentQuestions?: ExamSimulationDevelopmentQuestion[];
  trueFalseCount?: number;
  multipleChoiceCount?: number;
  developmentCount?: number;
  totalQuestions?: number;
}

export interface DraftExamSimulation {
  title: string;
  description?: string | null;
  categoryId: string;
  durationMinutes: number;
  trueFalseQuestions: ExamSimulationTrueFalseQuestion[];
  multipleChoiceQuestions: ExamSimulationMultipleChoiceQuestion[];
  developmentQuestions: ExamSimulationDevelopmentQuestion[];
}

export interface ExamSimulationsResponse {
  simulations: ExamSimulation[];
  pagination: {
    limit: number;
    offset: number;
  };
}

export interface CreateExamSimulationRequest {
  title: string;
  description?: string;
  category_id: string;
  duration_minutes: number;
  true_false_questions: Array<{
    statement: string;
    is_true: boolean;
    explanation?: string | null;
    order_index: number;
  }>;
  multiple_choice_questions: Array<{
    question: string;
    options: string[];
    correct_answer: string;
    explanation?: string | null;
    order_index: number;
  }>;
  development_questions: Array<{
    prompt: string;
    reference_answer?: string | null;
    evaluation_criteria?: string | null;
    max_points: number;
    order_index: number;
  }>;
}

export interface ExamSimulationGenerationJob {
  id: string;
  type: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: {
    stage: string;
    percent: number;
  };
  result: null | DraftExamSimulation;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface ExamSimulationSubmissionResult {
  attemptId: string;
  simulationId: string;
  score: number;
  earnedPoints: number;
  totalPoints: number;
  trueFalse: Array<{
    questionId: string;
    submitted: boolean | null;
    expected: boolean;
    correct: boolean;
    points: number;
    maxPoints: number;
  }>;
  multipleChoice: Array<{
    questionId: string;
    submitted: string | null;
    expected: string;
    correct: boolean;
    points: number;
    maxPoints: number;
  }>;
  development: Array<{
    questionId: string;
    submittedText: string;
    maxPoints: number;
    points: number;
    criteria?: string | null;
  }>;
}

export const examSimulationApi = {
  getAll: async (params?: {
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ExamSimulationsResponse> => {
    const response = await apiClient.get("/exam-simulations", { params });
    return response.data;
  },

  getById: async (id: string): Promise<ExamSimulation> => {
    const response = await apiClient.get(`/exam-simulations/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/exam-simulations/${id}`);
  },

  create: async (
    payload: CreateExamSimulationRequest,
  ): Promise<ExamSimulation> => {
    const response = await apiClient.post("/exam-simulations", payload);
    return response.data;
  },

  generate: async (formData: FormData): Promise<DraftExamSimulation> => {
    const response = await apiClient.post(
      "/exam-simulations/generate",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  startGenerateJob: async (
    formData: FormData,
  ): Promise<ExamSimulationGenerationJob> => {
    const response = await apiClient.post(
      "/exam-simulations/generate-async",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  getGenerationJob: async (
    jobId: string,
  ): Promise<ExamSimulationGenerationJob> => {
    const response = await apiClient.get(
      `/exam-simulations/generation-jobs/${jobId}`,
    );
    return response.data;
  },

  submit: async (
    simulationId: string,
    payload: {
      trueFalseAnswers: Array<{ questionId: string; answer: boolean }>;
      multipleChoiceAnswers: Array<{ questionId: string; answer: string }>;
      developmentAnswers: Array<{ questionId: string; answer: string }>;
    },
  ): Promise<ExamSimulationSubmissionResult> => {
    const response = await apiClient.post(
      `/exam-simulations/${simulationId}/submit`,
      payload,
    );
    return response.data;
  },
};
