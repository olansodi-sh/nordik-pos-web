import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export interface ApiErrorPayload {
  status: number | null;
  message: string;
  path?: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number | null;
  path?: string;
  details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.path = payload.path;
    this.details = payload.details;
  }
}

const AUTH_TOKEN_STORAGE_KEY = "nordikhat_pos_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  timeout: 15000,
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const status = error.response?.status ?? null;
    const responseMessage = error.response?.data?.message;
    const message = Array.isArray(responseMessage)
      ? responseMessage.join(", ")
      : responseMessage ?? error.message ?? "Error de red desconocido";

    const apiError = new ApiError({
      status,
      message,
      path: error.config?.url,
      details: error.response?.data,
    });

    if (status === 401) {
      setStoredToken(null);
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(
        `[API] ${error.config?.method?.toUpperCase() ?? "?"} ${apiError.path ?? "?"} -> ${status ?? "network error"}: ${message}`,
      );
    }

    return Promise.reject(apiError);
  },
);
