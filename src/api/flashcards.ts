import apiClient from "./client";

export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  source: "ai" | "manual";
  category_id: string;
  category?: {
    id: string;
    title: string;
    description?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  title: string;
  description?: string;
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  title: string;
  description?: string;
}

export interface CreateManualFlashCardRequest {
  question: string;
  answer: string;
  categoryId: string;
}

export interface FlashCardsResponse {
  flashcards: FlashCard[];
  pagination: {
    limit: number;
    offset: number;
  };
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: {
    limit: number;
    offset: number;
  };
}

export interface GenerateFlashCardResponse {
  question: string;
  answer: string;
  source?: "ai" | "manual";
}

export interface FlashcardGenerationJob {
  id: string;
  type: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: {
    stage: string;
    percent: number;
    metadata?: {
      completed?: number;
      total?: number;
      count?: number;
      fileName?: string;
      inputMode?: string;
      recommendedAsync?: boolean;
    };
  };
  metadata?: {
    quantity?: number;
    fileName?: string | null;
    inputMode?: string;
    recommendedAsync?: boolean;
  };
  result: null | {
    flashcards: FlashCard[];
  };
  error: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export const flashCardsApi = {
  /**
   * Generate a flashcard from uploaded file or text
   */
  generateFlashCard: async (
    file?: File,
    text?: string,
  ): Promise<GenerateFlashCardResponse> => {
    if (!file && !text) {
      throw new Error(
        "Se requiere un archivo o texto para generar la flashcard",
      );
    }

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (text) formData.append("text", text);

    const response = await apiClient.post(
      "/flashcards/generate-flashcard",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  /**
   * Generate multiple flashcards from uploaded file
   */
  generateFlashCards: async (
    file?: File,
    text?: string,
    quantity?: number,
  ): Promise<FlashCard[]> => {
    if (!file && !text) {
      throw new Error(
        "Se requiere un archivo o texto para generar la flashcard",
      );
    }

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (text) formData.append("text", text);
    if (quantity) {
      formData.append("quantity", quantity.toString());
    }

    const response = await apiClient.post(
      "/flashcards/generate-flashcards",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  startGenerateFlashCardsJob: async (
    file?: File,
    text?: string,
    quantity?: number,
  ): Promise<FlashcardGenerationJob> => {
    if (!file && !text) {
      throw new Error(
        "Se requiere un archivo o texto para generar la flashcard",
      );
    }

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (text) formData.append("text", text);
    if (quantity) {
      formData.append("quantity", quantity.toString());
    }

    const response = await apiClient.post(
      "/flashcards/generate-flashcards-async",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  getGenerationJob: async (jobId: string): Promise<FlashcardGenerationJob> => {
    const response = await apiClient.get(
      `/flashcards/generation-jobs/${jobId}`,
    );
    return response.data;
  },

  /**
   * Create a manual flashcard
   */
  createManualFlashCard: async (
    data: CreateManualFlashCardRequest,
  ): Promise<FlashCard> => {
    const response = await apiClient.post("/flashcards/create-flashcard", data);
    return response.data;
  },

  /**
   * Create multiple manual flashcards
   */
  createManualFlashCards: async (
    flashcards: CreateManualFlashCardRequest[],
  ): Promise<FlashCard[]> => {
    const response = await apiClient.post("/flashcards/create-flashcards", {
      flashcards,
    });
    return response.data.flashcards;
  },

  saveFlashCards: async (
    flashcards: Array<{
      question: string;
      answer: string;
      source?: "ai" | "manual";
      categoryId: string;
    }>,
  ): Promise<{ flashcards: FlashCard[]; message: string }> => {
    const response = await apiClient.post("/flashcards/save", { flashcards });
    return response.data;
  },

  /**
   * Get all flashcards for the authenticated user
   */
  getFlashCards: async (params?: {
    source?: "ai" | "manual";
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<FlashCardsResponse> => {
    const response = await apiClient.get("/flashcards", { params });
    return response.data;
  },

  /**
   * Get a specific flashcard by ID
   */
  getFlashCardById: async (id: string): Promise<FlashCard> => {
    const response = await apiClient.get(`/flashcards/${id}`);
    return response.data;
  },

  /**
   * Delete a flashcard by ID
   */
  deleteFlashCard: async (id: string): Promise<void> => {
    await apiClient.delete(`/flashcards/${id}`);
  },

  /**
   * Update a flashcard's question and/or answer
   */
  updateFlashCard: async (
    id: string,
    data: { question: string; answer: string },
  ): Promise<FlashCard> => {
    const response = await apiClient.patch(`/flashcards/${id}`, data);
    return response.data;
  },

  // Categories API
  /**
   * Create a new category
   */
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post("/categories", data);
    return response.data;
  },

  /**
   * Get all categories for the authenticated user
   */
  getCategories: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<CategoriesResponse> => {
    const response = await apiClient.get("/categories", { params });
    return response.data;
  },

  /**
   * Get a specific category by ID
   */
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * Update a category
   */
  updateCategory: async (
    id: string,
    data: Partial<CreateCategoryRequest>,
  ): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  // ── Spaced repetition ───────────────────────────────────────────────────────

  /** Cards due for review today (SM-2) */
  getDueCards: async (params?: {
    limit?: number;
    categoryId?: string;
  }): Promise<{ flashcards: FlashCard[]; count: number }> => {
    const response = await apiClient.get("/flashcards/due", { params });
    return response.data;
  },

  /** Review stats: due, new, learned, total */
  getReviewStats: async (): Promise<{
    due: number;
    newCards: number;
    learned: number;
    total: number;
  }> => {
    const response = await apiClient.get("/flashcards/review-stats");
    return response.data;
  },

  /**
   * Submit SM-2 quality rating after reviewing a card.
   * quality: 1=Again | 2=Hard | 3=Good | 4=Easy
   */
  submitReview: async (
    flashcardId: string,
    quality: 1 | 2 | 3 | 4,
  ): Promise<{
    flashcardId: string;
    quality: number;
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    nextReviewAt: string;
  }> => {
    const response = await apiClient.post(`/flashcards/${flashcardId}/review`, {
      quality,
    });
    return response.data;
  },

  /** Search flashcards by text */
  searchFlashCards: async (params: {
    q: string;
    categoryId?: string;
    limit?: number;
  }): Promise<{ flashcards: FlashCard[]; count: number }> => {
    const response = await apiClient.get("/flashcards/search", { params });
    return response.data;
  },

  /** Download all flashcards as CSV */
  exportFlashCards: async (categoryId?: string): Promise<void> => {
    const response = await apiClient.get("/flashcards/export", {
      params: categoryId ? { categoryId } : undefined,
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "flashcards.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
