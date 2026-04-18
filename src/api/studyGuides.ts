import apiClient from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudyGuide {
  id: string;
  userId: string;
  categoryId: string;
  category?: { id: string; title: string } | null;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudyGuideGenerationJob {
  id: string;
  type: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: { stage: string; percent: number };
  metadata?: {
    title?: string;
    fileName?: string | null;
    inputMode?: string;
  };
  result: null | StudyGuide;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const studyGuideApi = {
  startGenerateJob: (formData: FormData): Promise<StudyGuideGenerationJob> =>
    apiClient
      .post("/study-guides/generate-async", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  getGenerationJob: (jobId: string): Promise<StudyGuideGenerationJob> =>
    apiClient.get(`/study-guides/generation-jobs/${jobId}`).then((r) => r.data),

  getAll: (params?: {
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ guides: StudyGuide[] }> =>
    apiClient.get("/study-guides", { params }).then((r) => r.data),

  getById: (id: string): Promise<StudyGuide> =>
    apiClient.get(`/study-guides/${id}`).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    apiClient.delete(`/study-guides/${id}`).then((r) => r.data),
};
