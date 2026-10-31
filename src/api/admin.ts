import { api } from "./client";
import type {
  AdminAnalyticsSummary,
  AdminReportSummary,
  UserRole,
} from "@/types";

export async function fetchAnalytics() {
  const response =
    await api.get<AdminAnalyticsSummary>("/admin/analytics/summary");
  return response.data;
}

export async function fetchOperationsReport(days = 30) {
  const response = await api.get<AdminReportSummary>(
    "/admin/reports/summary",
    { params: { days } },
  );
  return response.data;
}

export type BroadcastRecipientMode = "all" | "role" | "user_ids";

export interface BroadcastPayload {
  title: string;
  content: string;
  recipient_mode: BroadcastRecipientMode;
  role?: UserRole | null;
  user_ids?: string[] | null;
  force?: boolean;
}

export interface BroadcastPreview {
  recipient_mode: BroadcastRecipientMode;
  role: string | null;
  total_recipients: number;
  by_role: Record<string, number>;
  requested_ids: number | null;
  inactive_or_unknown_ids: number | null;
}

export interface BroadcastResult {
  title: string;
  recipient_mode: BroadcastRecipientMode;
  role: string | null;
  recipients_targeted: number;
  notifications_created: number;
  forced: boolean;
  channel: string;
}

export async function previewBroadcast(payload: BroadcastPayload) {
  const response = await api.post<BroadcastPreview>(
    "/admin/content/broadcast/preview",
    payload,
  );
  return response.data;
}

export async function sendBroadcast(payload: BroadcastPayload) {
  const response = await api.post<BroadcastResult>(
    "/admin/content/broadcast",
    payload,
  );
  return response.data;
}


