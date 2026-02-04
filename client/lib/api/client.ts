import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Cookie'ler için gerekli
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if it's a token expired error
      if (error.response?.data?.code === "TOKEN_EXPIRED") {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          await api.post("/auth/refresh");
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
