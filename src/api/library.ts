import apiClient from "./client";

export interface PublicCategory {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: string;
  flashcardCount: number;
  quizCount: number;
  trueFalseCount: number;
}

export interface CategoryPreview {
  id: string;
  title: string;
  description?: string;
  flashcards: { id: string; question: string }[];
  quizzes: { id: string; title: string; description?: string }[];
  trueFalseSets: { id: string; title: string; description?: string }[];
}

export interface ForkResult {
  categoryId: string;
  flashcardCount: number;
  quizCount: number;
  trueFalseCount: number;
}

export const libraryApi = {
  /** Fetch public study topics (categories) with content counts */
  getCategories: async (
    params: { limit?: number; offset?: number; search?: string } = {},
  ) => {
    const response = await apiClient.get("/library", { params });
    return response.data as { categories: PublicCategory[]; total: number };
  },

  /** Preview the content of a public study topic */
  getPreview: async (categoryId: string) => {
    const response = await apiClient.get(`/library/${categoryId}/preview`);
    return response.data as CategoryPreview;
  },

  /** Import an entire study topic into the authenticated user library */
  forkCategory: async (categoryId: string) => {
    const response = await apiClient.post(`/library/${categoryId}/fork`);
    return response.data as ForkResult;
  },
};

export const publishApi = {
  /** Publish / unpublish a category and all its content */
  publishCategory: async (categoryId: string, isPublic: boolean) => {
    const response = await apiClient.patch(
      `/categories/${categoryId}/publish`,
      { is_public: isPublic },
    );
    return response.data as { id: string; is_public: boolean };
  },
};
