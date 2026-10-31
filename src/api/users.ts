import { api } from "./client";
import type { User, UserRole } from "@/types";

export async function fetchMe() {
  const response = await api.get<User>("/users/me");
  return response.data;
}

export async function fetchSetupStatus() {
  const response = await api.get<{ profile_completed: boolean }>(
    "/users/me/setup-status",
  );
  return response.data;
}

export interface ProfileUpdate {
  full_name?: string;
  phone?: string;
  timezone?: string;
}

export async function updateMe(input: ProfileUpdate) {
  const response = await api.put<User>("/users/me", input);
  return response.data;
}

export async function fetchUsers() {
  const response = await api.get<User[]>("/users/");
  return response.data;
}

export async function updateUserFlags(
  userId: string,
  input: { is_active?: boolean; is_verified?: boolean },
) {
  const response = await api.patch<User>(`/users/${userId}`, input);
  return response.data;
}

export async function changeUserRole(userId: string, role: UserRole) {
  const response = await api.patch<User>(`/users/${userId}/role`, { role });
  return response.data;
}
