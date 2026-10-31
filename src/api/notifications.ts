import { api } from "./client";
import type { AppNotification } from "@/types";

export async function fetchNotifications() {
  const response = await api.get<AppNotification[]>("/notifications");
  return response.data;
}

export async function markNotificationRead(id: string) {
  const response = await api.patch<AppNotification>(
    `/notifications/${id}/read`,
  );
  return response.data;
}

/**
 * Existing backend behaviour: processes reminders for the authenticated user.
 * This can create notification rows, so the UI only calls it once per session.
 */
export async function processMoodReminders() {
  const response = await api.post("/notifications/process-mood-reminders");
  return response.data;
}
