import apiClient from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  metadata?: {
    firstName?: string;
    lastName?: string;
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

export const authApi = {
  /**
   * Sign up a new user
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
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
   * Update current user password
   */
  updatePassword: async (password: string): Promise<{ message: string }> => {
    const response = await apiClient.put("/auth/password", { password });
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
