import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Cookie'ler için gerekli
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints that should never trigger a token refresh retry
const AUTH_ENDPOINTS = ["/auth/refresh", "/auth/login", "/auth/register", "/auth/logout"];

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint = AUTH_ENDPOINTS.some((url) =>
      originalRequest?.url?.includes(url)
    );

    // On any 401 from a protected endpoint, attempt a silent token refresh.
    // We skip auth endpoints to avoid infinite loops and pointless retries.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is also expired/invalid — send user to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
