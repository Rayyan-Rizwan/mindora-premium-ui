import axios from "axios";

export const TOKEN_KEY = "mindora_access_token";
export const SESSION_EXPIRED_EVENT = "mindora:session-expired";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

/**
 * Local development goes through the Vite proxy (`/api` -> 127.0.0.1:8000),
 * which avoids depending on the backend CORS allowlist. A deployment should
 * set VITE_API_BASE_URL to the absolute backend URL including /api/v1.
 */
const baseURL = configuredBaseUrl || "/api/v1";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    // The existing backend is commonly demoed through ngrok.
    "ngrok-skip-browser-warning": "1",
  },
  timeout: 45_000,
});

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
];

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const tokenUsed = error.config?.headers?.get?.("Authorization");

    if (
      status === 401 &&
      !AUTH_PATHS.some((path) => url.includes(path)) &&
      tokenUsed === `Bearer ${getStoredToken()}`
    ) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  },
);
