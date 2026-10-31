import axios from "axios";

export interface ApiErrorInfo {
  status: number | null;
  message: string;
  isNetworkError: boolean;
}

export function describeApiError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const data = error.response?.data as
      | { detail?: unknown; message?: unknown }
      | undefined;

    let message = fallback;
    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = "Please check the information you entered and try again.";
    } else if (typeof data?.message === "string") {
      message = data.message;
    } else if (!error.response) {
      message = "We could not reach the Mindora service. Check your connection and try again.";
    }

    return { status, message, isNetworkError: !error.response };
  }

  if (error instanceof Error && error.message) {
    return { status: null, message: error.message, isNetworkError: false };
  }

  return { status: null, message: fallback, isNetworkError: false };
}

export function getApiErrorMessage(
  error: unknown,
  fallback?: string,
): string {
  return describeApiError(error, fallback).message;
}
