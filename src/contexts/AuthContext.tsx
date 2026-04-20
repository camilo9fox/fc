import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, AuthResponse } from "../api";

interface User {
  id: string;
  email: string;
  created_at: string;
  metadata?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, metadata?: any) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored token on app start and restore user profile
  useEffect(() => {
    const restoreAuth = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        setToken(storedToken);

        try {
          const response = await authApi.getProfile();
          setUser(response.user);
        } catch (error: any) {
          console.error("Error restoring auth profile:", error);
          setUser(null);
          setToken(null);
          localStorage.removeItem("authToken");
        }
      }
      setIsLoading(false);
    };

    restoreAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authApi.signin({ email, password });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("authToken", response.token);
    } catch (error: any) {
      // If it's a 401, clear any stale auth state
      if (error.response?.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("authToken");
      }
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, metadata?: any) => {
    try {
      const response: AuthResponse = await authApi.signup({
        email,
        password,
        metadata,
      });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("authToken", response.token);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Tell backend to revoke refresh token cookie
      await authApi.signout();
    } catch {
      // Ignore errors — we clear local state regardless
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("authToken");
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
