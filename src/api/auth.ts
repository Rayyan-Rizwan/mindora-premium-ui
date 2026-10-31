import { api } from "./client";
import type { AuthMessage, LoginResponse } from "@/types";

export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
}

export async function login(email: string, password: string) {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function register(input: RegisterInput) {
  const response = await api.post("/auth/register", input);
  return response.data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function verifyEmail(token: string) {
  const response = await api.get<AuthMessage>("/auth/verify-email", {
    params: { token },
  });
  return response.data;
}

export async function requestPasswordReset(email: string) {
  const response = await api.post<AuthMessage>("/auth/forgot-password", {
    email,
  });
  return response.data;
}

export async function resetPassword(token: string, password: string) {
  const response = await api.post<AuthMessage>("/auth/reset-password", {
    token,
    password,
  });
  return response.data;
}
