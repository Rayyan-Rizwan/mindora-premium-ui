import { afterEach, describe, expect, it } from "vitest";
import { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { handleDemoRequest } from "@/demo/mockApi";
import {
  DEMO_ROLE_KEY,
  getDemoRole,
  getDemoUser,
  isDemoActive,
  setDemoRole,
} from "@/demo/demoSession";
import type {
  AdminAnalyticsSummary,
  Appointment,
  AssessmentStatus,
  ChatResponse,
  ConversationHistory,
  ConversationSummary,
  MoodSummary,
  Professional,
  User,
} from "@/types";

function request(
  url: string,
  method = "get",
  data?: unknown,
): InternalAxiosRequestConfig {
  return {
    url,
    method,
    data,
    headers: new AxiosHeaders(),
    baseURL: "/api/v1",
  } as InternalAxiosRequestConfig;
}

async function get<T>(
  url: string,
  method = "get",
  data?: unknown,
): Promise<T> {
  const response = await handleDemoRequest(request(url, method, data));
  return response.data as T;
}

afterEach(() => {
  setDemoRole(null);
});

describe("demo mode", () => {
  it("serves a complete member workspace without any network request", async () => {
    setDemoRole("user");

    const me = await get<User>("/users/me");
    expect(me.role).toBe("user");
    expect(me.is_verified).toBe(true);
    expect(me.profile?.timezone).toBeTruthy();

    const status = await get<AssessmentStatus>("/assessment/status");
    expect(status.completed).toBe(true);

    const conversations = await get<ConversationSummary[]>("/chat/conversations");
    expect(conversations.length).toBeGreaterThan(0);

    const history = await get<ConversationHistory>(
      `/chat/history/${conversations[0].id}`,
    );
    expect(history.messages.some((message) => message.sender === "ai")).toBe(
      true,
    );

    const reply = await get<ChatResponse>("/chat", "post", {
      message: "I feel anxious",
      conversation_id: null,
    });
    expect(reply.ai_response.content.length).toBeGreaterThan(0);
    expect(reply.ai_response.sender).toBe("ai");

    const summary = await get<MoodSummary>("/mood/summary");
    expect(summary.moods.length).toBeGreaterThan(0);

    const appointments = await get<Appointment[]>("/appointments/me");
    expect(appointments.every((item) => item.patient_id === me.id)).toBe(true);

    const professionals = await get<Professional[]>("/professionals");
    expect(professionals.length).toBeGreaterThan(0);
  });

  it("keeps professional and admin scopes separate", async () => {
    setDemoRole("professional");
    const professional = await get<User>("/users/me");
    expect(professional.role).toBe("professional");

    const ownAppointments = await get<Appointment[]>("/appointments/me");
    expect(
      ownAppointments.every(
        (item) => item.professional_id === professional.id,
      ),
    ).toBe(true);

    setDemoRole("admin");
    const analytics = await get<AdminAnalyticsSummary>(
      "/admin/analytics/summary",
    );
    expect(analytics.users.total).toBeGreaterThan(0);
    expect(analytics.appointments.total).toBeGreaterThan(0);
  });

  it("refuses real authentication instead of faking a login", async () => {
    setDemoRole("user");

    await expect(
      get("/auth/login", "post", { email: "a@b.com", password: "secret" }),
    ).rejects.toMatchObject({
      response: { status: 400 },
    });
    await expect(
      get("/auth/register", "post", { email: "a@b.com" }),
    ).rejects.toMatchObject({
      response: { status: 400 },
    });
  });

  it("tracks the active role for session-scoped routing and cleanup", () => {
    expect(isDemoActive()).toBe(false);

    setDemoRole("admin");
    expect(getDemoRole()).toBe("admin");
    expect(isDemoActive()).toBe(true);
    expect(sessionStorage.getItem(DEMO_ROLE_KEY)).toBe("admin");
    expect(getDemoUser()).toBeNull();

    setDemoRole(null);
    expect(isDemoActive()).toBe(false);
    expect(sessionStorage.getItem(DEMO_ROLE_KEY)).toBeNull();
  });
});
