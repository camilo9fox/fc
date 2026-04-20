import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Base API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Extend config to support retry tracking
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

// Exponential backoff: wait 2^attempt * 500ms (capped at 8s)
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const RETRY_DELAYS = [500, 1000, 2000]; // 3 retries max

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Required for httpOnly refresh token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Track concurrent refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig;

    // Only attempt refresh on 401 errors, not on refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/signin") &&
      !originalRequest.url?.includes("/auth/signup")
    ) {
      if (isRefreshing) {
        // Queue request while refresh is in progress
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiClient.post("/auth/refresh");
        const { token } = response.data;
        localStorage.setItem("authToken", token);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("authToken");
        // Redirect to login page
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Retry interceptor: handles 429 (rate limit) and 5xx / network errors ──
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableRequestConfig;

    // Don't retry on auth endpoints or if no config
    if (!config || config.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // 429 — rate limited: respect Retry-After header, then retry once
    if (status === 429) {
      const retryAfterSeconds = parseInt(
        error.response?.headers?.["retry-after"] ?? "5",
        10,
      );
      const waitMs = (isNaN(retryAfterSeconds) ? 5 : retryAfterSeconds) * 1000;

      // Attach retry-after info so components can show a message
      const enhancedError = Object.assign(error, {
        isRateLimit: true,
        retryAfterSeconds: retryAfterSeconds,
        retryAfterMs: waitMs,
      });

      // Retry once after the indicated wait
      if (!config._retry) {
        config._retry = true;
        await sleep(waitMs);
        return apiClient(config);
      }

      return Promise.reject(enhancedError);
    }

    // 5xx or network error — retry with backoff (up to 3 times)
    const isNetworkError = !error.response;
    const isServerError = status !== undefined && status >= 500 && status < 600;

    if (isNetworkError || isServerError) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      const attempt = config._retryCount - 1;

      if (attempt < RETRY_DELAYS.length) {
        await sleep(RETRY_DELAYS[attempt]);
        return apiClient(config);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
