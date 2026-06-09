import apiClient from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  metadata?: {
    full_name?: string;
    avatar_url?: string;
    locale?: string;
    timezone?: string;
  };
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    created_at: string;
    metadata?: any;
  };
  token: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  metadata?: any;
}

export interface OnboardingProfile {
  goals?: string[];
  dailyTime?: "10-15" | "20-30" | "45+";
  preferredFormat?: "flashcards" | "quizzes" | "mixed";
  studyLevel?: "school" | "university" | "professional";
  weeklyGoalDays?: 3 | 5 | 7;
  sessionPreference?: "morning" | "afternoon" | "night" | "flexible";
  challengeAreas?: string[];
  examDate?: string | null;
  recommendedPath?: string;
  introSeen?: boolean;
  completedAt?: string | null;
  skipped?: boolean;
  updatedAt?: string;
}

export const authApi = {
  /**
   * Sign up a new user
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  },

  /**
   * Resend email verification link
   */
  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post("/auth/resend-verification", { email });
  },

  /**
   * Sign in an existing user
   */
  signin: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/signin", data);
    return response.data;
  },

  /**
   * Sign out the current user
   */
  signout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/signout");
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{ user: User }> => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },

  /**
   * Reset user password
   */
  resetPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/reset-password", { email });
    return response.data;
  },

  /**
   * Update current user profile (name and/or email)
   */
  updateProfile: async (data: {
    name?: string;
    email?: string;
  }): Promise<{ user: User }> => {
    const response = await apiClient.put("/auth/profile", data);
    return response.data;
  },

  /**
   * Get onboarding profile persisted for current user
   */
  getOnboardingProfile: async (): Promise<{
    profile: OnboardingProfile | null;
  }> => {
    const response = await apiClient.get("/auth/onboarding-profile");
    return response.data;
  },

  /**
   * Update onboarding profile persisted for current user
   */
  updateOnboardingProfile: async (
    data: Partial<OnboardingProfile>,
  ): Promise<{ profile: OnboardingProfile }> => {
    const response = await apiClient.put("/auth/onboarding-profile", data);
    return response.data;
  },

  /**
   * Update current user password
   */
  updatePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.put("/auth/password", data);
    return response.data;
  },
  /**
   * Delete the current user account
   */
  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete("/auth/account");
    return response.data;
  },
};
