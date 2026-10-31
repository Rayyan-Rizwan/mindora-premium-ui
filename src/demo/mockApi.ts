import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type {
  AdminAnalyticsSummary,
  AdminReportDailyPoint,
  AdminReportSummary,
  AppNotification,
  Appointment,
  AssessmentInstrument,
  AssessmentQuestion,
  AssessmentResult,
  AssessmentSession,
  AssessmentStatus,
  ChatMessage,
  ChatResponse,
  ConversationHistory,
  ConversationSummary,
  MoodRecord,
  MoodSummary,
  Professional,
  ProfessionalApplication,
  ProfessionalAvailability,
  ProfessionalApprovalStatus,
  User,
  WeeklySchedule,
} from "@/types";
import { daysAgoString, localDayString } from "@/lib/date";
import { getDemoRole, type DemoRole } from "./demoSession";

/* --------------------------------- Helpers -------------------------------- */

const pad = (value: number) => String(value).padStart(2, "0");

function iso(date: Date): string {
  return date.toISOString().slice(0, 19);
}

function nowIso(): string {
  return iso(new Date());
}

function hoursAgo(hours: number): string {
  return iso(new Date(Date.now() - hours * 3_600_000));
}

function dateTime(daysFromToday: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, minute, 0, 0);
  return iso(date);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return round1(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function viewerTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

/* ---------------------------------- Users --------------------------------- */

function demoUser(
  role: DemoRole,
  input: Partial<User> & { full_name: string; email: string },
): User {
  return {
    ...input,
    id: input.id ?? `demo-${role}`,
    email: input.email,
    full_name: input.full_name,
    role,
    is_verified: input.is_verified ?? true,
    is_active: input.is_active ?? true,
    is_protected: false,
    created_at: input.created_at ?? "2026-01-12T09:20:00",
    profile: input.profile === undefined
      ? { phone: null, timezone: "Asia/Karachi" }
      : input.profile,
  };
}

const demoUsers: Record<DemoRole, User> = {
  user: demoUser("user", {
    full_name: "Ayesha Khan",
    email: "demo.member@mindora.local",
    profile: { phone: "+92 300 0000000", timezone: "Asia/Karachi" },
  }),
  professional: demoUser("professional", {
    full_name: "Dr. Sara Mahmood",
    email: "demo.professional@mindora.local",
    profile: { phone: "+92 321 0000000", timezone: "Asia/Karachi" },
  }),
  admin: demoUser("admin", {
    full_name: "Demo Administrator",
    email: "demo.admin@mindora.local",
    profile: { phone: null, timezone: "Asia/Karachi" },
  }),
};

const directoryUsers: User[] = [
  demoUsers.user,
  demoUsers.professional,
  demoUsers.admin,
  demoUser("user", {
    id: "demo-account-bilal",
    full_name: "Bilal Ahmed",
    email: "bilal.demo@mindora.local",
    profile: { phone: null, timezone: "Asia/Karachi" },
    created_at: "2026-03-04T14:10:00",
  }),
  demoUser("user", {
    id: "demo-account-mariam",
    full_name: "Mariam Noor",
    email: "mariam.demo@mindora.local",
    is_verified: false,
    profile: { phone: null, timezone: "Asia/Karachi" },
    created_at: "2026-06-18T08:45:00",
  }),
  demoUser("user", {
    id: "demo-account-omar",
    full_name: "Omar Sheikh",
    email: "omar.demo@mindora.local",
    is_active: false,
    is_verified: false,
    profile: null,
    created_at: "2026-02-22T17:05:00",
  }),
];

/* -------------------------------- Mood data -------------------------------- */

const MOOD_SAMPLES: { daysAgo: number; score: number; note?: string }[] = [
  { daysAgo: 29, score: 6 },
  { daysAgo: 27, score: 7 },
  { daysAgo: 26, score: 5 },
  { daysAgo: 24, score: 6 },
  { daysAgo: 23, score: 8 },
  { daysAgo: 21, score: 7 },
  { daysAgo: 20, score: 6 },
  { daysAgo: 19, score: 5 },
  { daysAgo: 17, score: 6 },
  { daysAgo: 16, score: 7 },
  { daysAgo: 15, score: 6 },
  { daysAgo: 13, score: 8 },
  { daysAgo: 12, score: 7 },
  { daysAgo: 11, score: 5 },
  { daysAgo: 9, score: 6 },
  { daysAgo: 8, score: 4 },
  { daysAgo: 7, score: 6 },
  { daysAgo: 6, score: 7 },
  { daysAgo: 5, score: 8 },
  { daysAgo: 4, score: 7 },
  { daysAgo: 2, score: 5 },
  { daysAgo: 1, score: 6 },
  {
    daysAgo: 0,
    score: 7,
    note: "A quieter evening after a long day. The walk home helped.",
  },
];

function buildMoodRecords(): MoodRecord[] {
  return MOOD_SAMPLES.map(({ daysAgo, score, note }) => {
    const date = daysAgoString(daysAgo);
    return {
      id: `demo-mood-${date}`,
      mood_score: score,
      mood_label: null,
      note: note ?? null,
      mood_date: date,
      created_at: `${date}T20:00:00`,
      updated_at: `${date}T20:00:00`,
    };
  }).sort((a, b) => a.mood_date.localeCompare(b.mood_date));
}

function buildMoodSummary(records: MoodRecord[]): MoodSummary {
  const sorted = [...records].sort((a, b) =>
    a.mood_date.localeCompare(b.mood_date),
  );
  const last30 = sorted.filter((record) => record.mood_date >= daysAgoString(29));
  const scores = sorted.map((record) => record.mood_score);
  const lastSevenDates = new Set(
    Array.from({ length: 7 }, (_, index) => daysAgoString(index)),
  );
  const previousSevenDates = new Set(
    Array.from({ length: 7 }, (_, index) => daysAgoString(index + 7)),
  );
  const currentSeven = sorted.filter((record) =>
    lastSevenDates.has(record.mood_date),
  );
  const previousSeven = sorted.filter((record) =>
    previousSevenDates.has(record.mood_date),
  );
  const currentAverage = average(currentSeven.map((record) => record.mood_score));
  const previousAverage = average(
    previousSeven.map((record) => record.mood_score),
  );

  let streak = 0;
  for (let index = 0; index < 30; index += 1) {
    const date = daysAgoString(index);
    if (sorted.some((record) => record.mood_date === date)) {
      streak += 1;
    } else {
      break;
    }
  }

  return {
    period: { start_date: daysAgoString(29), end_date: localDayString() },
    statistics: {
      average_mood: average(scores),
      highest_mood: scores.length ? Math.max(...scores) : null,
      lowest_mood: scores.length ? Math.min(...scores) : null,
      total_check_ins: last30.length,
    },
    trends: {
      current_7_day_average: currentAverage,
      previous_7_day_average: previousAverage,
      weekly_change:
        currentAverage !== null && previousAverage !== null
          ? round1(currentAverage - previousAverage)
          : null,
      overall_average: average(scores),
      current_streak: streak,
      missing_days_last_7_days: 7 - currentSeven.length,
    },
    moods: last30.map((record) => ({
      date: record.mood_date,
      score: record.mood_score,
    })),
  };
}

/* ------------------------------- Chat data -------------------------------- */

const AI_REPLIES = [
  "That sounds like a lot to carry, and it makes sense that it feels heavy. Could we slow it down together — what part of today is loudest in your mind right now?",
  "Thank you for trusting me with that. You do not have to solve everything at once. What is one small thing that might make the next hour a little gentler?",
  "I am here with you in this. It can help to name what you notice in your body as well as your thoughts. Is there a place where the tension sits?",
];

const conversations: ConversationSummary[] = [
  {
    id: "demo-conv-1",
    title: "A quieter evening",
    started_at: hoursAgo(31),
  },
  {
    id: "demo-conv-2",
    title: "Starting the week gently",
    started_at: hoursAgo(52),
  },
];

const histories: Record<string, ChatMessage[]> = {
  "demo-conv-1": [
    {
      id: "demo-msg-1",
      sender: "user",
      content: "I’ve been feeling overwhelmed lately.",
      created_at: hoursAgo(31),
    },
    {
      id: "demo-msg-2",
      sender: "ai",
      content:
        "That sounds like a lot to hold. Let’s take it one piece at a time — what has felt heaviest today?",
      created_at: hoursAgo(31),
    },
    {
      id: "demo-msg-3",
      sender: "user",
      content: "Mostly the evenings. Everything catches up with me.",
      created_at: hoursAgo(30),
    },
    {
      id: "demo-msg-4",
      sender: "ai",
      content:
        "Evenings can be where the day finally asks something of us. A short, kind routine — a shower, a warm drink, five slow breaths — might give the evening a softer edge. What feels possible for you?",
      created_at: hoursAgo(30),
    },
  ],
  "demo-conv-2": [
    {
      id: "demo-msg-5",
      sender: "user",
      content: "I want to start the week without dreading it.",
      created_at: hoursAgo(52),
    },
    {
      id: "demo-msg-6",
      sender: "ai",
      content:
        "That is a gentle intention to begin with. We could choose one small anchor for Monday — a ten-minute walk, an early night, or a message to someone safe. Which one sounds least like pressure?",
      created_at: hoursAgo(52),
    },
  ],
};

/* ----------------------------- Professionals ------------------------------ */

const weekdayAvailability: WeeklySchedule = {
  monday: [{ start: "09:00", end: "13:00" }],
  tuesday: [{ start: "14:00", end: "18:00" }],
  wednesday: [{ start: "09:00", end: "13:00" }],
  thursday: [{ start: "14:00", end: "18:00" }],
  friday: [{ start: "09:00", end: "12:00" }],
};

const professionals: Professional[] = [
  {
    id: "demo-professional",
    full_name: "Dr. Sara Mahmood",
    specialization: "Clinical Psychologist",
    qualification: "MSc Clinical Psychology",
    bio: "Works with adults navigating anxiety, overwhelm and life transitions. Sessions are collaborative and paced around what feels useful.",
    years_experience: 9,
    consultation_fee: "PKR 4,500",
    availability: weekdayAvailability,
    consultation_types: ["chat", "audio", "video"],
  },
  {
    id: "demo-professional-2",
    full_name: "Dr. Imran Qureshi",
    specialization: "Psychiatrist",
    qualification: "MBBS, FCPS (Psychiatry)",
    bio: "Provides psychiatric consultation and medication review. This demo profile does not represent a real clinician.",
    years_experience: 14,
    consultation_fee: "PKR 7,000",
    availability: weekdayAvailability,
    consultation_types: ["audio", "video"],
  },
  {
    id: "demo-professional-3",
    full_name: "Hina Raza",
    specialization: "Counsellor",
    qualification: "MSc Counselling Psychology",
    bio: "Offers supportive counselling for stress, self-worth and relationships, with a warm and practical style.",
    years_experience: 6,
    consultation_fee: "PKR 3,000",
    availability: weekdayAvailability,
    consultation_types: ["chat", "audio"],
  },
  {
    id: "demo-professional-4",
    full_name: "Dr. Zara Ahmed",
    specialization: "Clinical Psychologist",
    qualification: "PhD Clinical Psychology",
    bio: "Focuses on burnout, sleep and emotional regulation using evidence-informed talk therapy.",
    years_experience: 11,
    consultation_fee: "PKR 5,500",
    availability: weekdayAvailability,
    consultation_types: ["chat", "video"],
  },
];

/* ------------------------------ Appointments ------------------------------ */

const appointments: Appointment[] = [
  {
    id: "demo-appt-1",
    patient_id: demoUsers.user.id,
    professional_id: "demo-professional",
    scheduled_at: dateTime(1, 10),
    duration_minutes: 30,
    appointment_type: "chat",
    status: "confirmed",
    created_at: daysAgoTime(3),
    meeting_url: null,
    professional_name: "Dr. Sara Mahmood",
    specialization: "Clinical Psychologist",
    patient_name: "Ayesha Khan",
  },
  {
    id: "demo-appt-2",
    patient_id: demoUsers.user.id,
    professional_id: "demo-professional-2",
    scheduled_at: dateTime(3, 15),
    duration_minutes: 45,
    appointment_type: "video",
    status: "pending",
    created_at: daysAgoTime(1, 12),
    meeting_url: null,
    professional_name: "Dr. Imran Qureshi",
    specialization: "Psychiatrist",
    patient_name: "Ayesha Khan",
  },
  {
    id: "demo-appt-3",
    patient_id: demoUsers.user.id,
    professional_id: "demo-professional-3",
    scheduled_at: dateTime(-8, 11),
    duration_minutes: 30,
    appointment_type: "audio",
    status: "completed",
    created_at: daysAgoTime(16),
    meeting_url: null,
    professional_name: "Hina Raza",
    specialization: "Counsellor",
    patient_name: "Ayesha Khan",
  },
  {
    id: "demo-appt-4",
    patient_id: demoUsers.user.id,
    professional_id: "demo-professional",
    scheduled_at: dateTime(-12, 16),
    duration_minutes: 30,
    appointment_type: "chat",
    status: "cancelled",
    created_at: daysAgoTime(20),
    meeting_url: null,
    professional_name: "Dr. Sara Mahmood",
    specialization: "Clinical Psychologist",
    patient_name: "Ayesha Khan",
  },
  {
    id: "demo-appt-5",
    patient_id: "demo-account-bilal",
    professional_id: "demo-professional",
    scheduled_at: dateTime(2, 12),
    duration_minutes: 30,
    appointment_type: "video",
    status: "pending",
    created_at: hoursAgo(20),
    meeting_url: null,
    professional_name: "Dr. Sara Mahmood",
    specialization: "Clinical Psychologist",
    patient_name: "Bilal Ahmed",
  },
  {
    id: "demo-appt-6",
    patient_id: "demo-account-mariam",
    professional_id: "demo-professional",
    scheduled_at: dateTime(4, 9),
    duration_minutes: 45,
    appointment_type: "audio",
    status: "confirmed",
    created_at: daysAgoTime(2),
    meeting_url: null,
    professional_name: "Dr. Sara Mahmood",
    specialization: "Clinical Psychologist",
    patient_name: "Mariam Noor",
  },
];

function daysAgoTime(days: number, hour = 18): string {
  return dateTime(-days, hour);
}

/* ----------------------------- Notifications ------------------------------ */

interface DemoNotification extends AppNotification {
  audience: DemoRole;
}

const notifications: DemoNotification[] = [
  {
    id: "demo-note-1",
    audience: "user",
    type: "appointment",
    title: "Session confirmed",
    content:
      "Your text session with Dr. Sara Mahmood is confirmed. A meeting link will appear once it is added.",
    is_read: false,
    created_at: hoursAgo(3),
    appointment_id: "demo-appt-1",
  },
  {
    id: "demo-note-2",
    audience: "user",
    type: "mood_reminder",
    title: "A gentle check-in",
    content: "One honest number is enough. Your mood tracker is ready when you are.",
    is_read: false,
    created_at: hoursAgo(8),
    appointment_id: null,
  },
  {
    id: "demo-note-3",
    audience: "user",
    type: "assessment_reminder",
    title: "Your screening is on file",
    content:
      "You can revisit the 15-question screening whenever you want another snapshot.",
    is_read: true,
    created_at: hoursAgo(30),
    appointment_id: null,
  },
  {
    id: "demo-note-4",
    audience: "user",
    type: "motivational",
    title: "A small reminder",
    content: "You do not have to earn rest. It is allowed.",
    is_read: false,
    created_at: hoursAgo(50),
    appointment_id: null,
  },
  {
    id: "demo-note-5",
    audience: "professional",
    type: "appointment",
    title: "New appointment request",
    content: "Bilal Ahmed requested a 30-minute video session.",
    is_read: false,
    created_at: hoursAgo(20),
    appointment_id: "demo-appt-5",
  },
  {
    id: "demo-note-6",
    audience: "professional",
    type: "appointment",
    title: "Upcoming confirmed session",
    content: "Your session with Mariam Noor is confirmed for this week.",
    is_read: false,
    created_at: hoursAgo(26),
    appointment_id: "demo-appt-6",
  },
  {
    id: "demo-note-7",
    audience: "admin",
    type: "system",
    title: "Application awaiting review",
    content: "A professional application is waiting in the review queue.",
    is_read: false,
    created_at: hoursAgo(5),
    appointment_id: null,
  },
  {
    id: "demo-note-8",
    audience: "admin",
    type: "system",
    title: "Weekly operations summary",
    content: "The read-only operations report is available for the last 30 days.",
    is_read: true,
    created_at: hoursAgo(40),
    appointment_id: null,
  },
];

/* ------------------------------- Assessments ------------------------------ */

const WHO5_OPTIONS = [
  { label: "All of the time", value: 5 },
  { label: "Most of the time", value: 4 },
  { label: "More than half of the time", value: 3 },
  { label: "Less than half of the time", value: 2 },
  { label: "Some of the time", value: 1 },
  { label: "At no time", value: 0 },
];

const GAD7_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

const MOOD_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "A little", value: 1 },
  { label: "Quite a lot", value: 2 },
  { label: "Most of the time", value: 3 },
];

const SAFETY_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Briefly, once", value: 1 },
  { label: "More than once", value: 2 },
  { label: "Often", value: 3 },
];

const WHO5_QUESTIONS = [
  "I have felt cheerful and in good spirits.",
  "I have felt calm and relaxed.",
  "I have felt active and vigorous.",
  "I woke up feeling fresh and rested.",
  "My daily life has been filled with things that interest me.",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious or on edge.",
  "Not being able to stop or control worrying.",
  "Worrying too much about different things.",
  "Trouble relaxing.",
  "Being so restless that it is hard to sit still.",
  "Becoming easily annoyed or irritable.",
  "Feeling afraid as if something awful might happen.",
];

function assessmentQuestions(): AssessmentQuestion[] {
  const questions: AssessmentQuestion[] = [];
  WHO5_QUESTIONS.forEach((question, index) => {
    questions.push({
      code: `WHO5_${index + 1}`,
      question,
      options: WHO5_OPTIONS,
    });
  });
  GAD7_QUESTIONS.forEach((question, index) => {
    questions.push({
      code: `GAD7_${index + 1}`,
      question,
      options: GAD7_OPTIONS,
    });
  });
  questions.push({
    code: "MOOD_1",
    question:
      "Over the past two weeks, how often have you felt low, flat or hopeless?",
    options: MOOD_OPTIONS,
  });
  questions.push({
    code: "STRESS_1",
    question: "How often have daily demands felt like more than you can manage?",
    options: MOOD_OPTIONS,
  });
  questions.push({
    code: "SAFETY_1",
    question:
      "In the past two weeks, have you had thoughts of ending your life or of harming yourself?",
    options: SAFETY_OPTIONS,
  });
  return questions;
}

const instruments: AssessmentInstrument[] = [
  {
    code: "initial",
    name: "Initial wellbeing screening",
    description:
      "A 15-question screening combining WHO-5, GAD-7, mood, stress and safety items.",
  },
];

/* ------------------------------- Applications ----------------------------- */

const applications: ProfessionalApplication[] = [
  {
    id: "demo-application-1",
    user_id: "demo-account-nadia",
    approval_status: "pending",
    license_number: "PSY-44821",
    specialization: "Clinical Psychologist",
    qualification: "MSc Clinical Psychology",
    bio: "Seven years of experience supporting adults with anxiety and burnout. Sample application created for demo mode.",
    years_experience: 7,
    consultation_fee: "PKR 4,000",
    availability: weekdayAvailability,
    consultation_types: ["chat", "video"],
    is_verified: true,
    created_at: daysAgoTime(2),
    updated_at: null,
    applicant_name: "Nadia Farooq",
    applicant_email: "nadia.demo@mindora.local",
    applicant_is_active: true,
  },
  {
    id: "demo-application-2",
    user_id: demoUsers.professional.id,
    approval_status: "approved",
    license_number: "PSY-31876",
    specialization: "Clinical Psychologist",
    qualification: "MSc Clinical Psychology",
    bio: "Approved professional profile used for the demo appointment screens.",
    years_experience: 9,
    consultation_fee: "PKR 4,500",
    availability: weekdayAvailability,
    consultation_types: ["chat", "audio", "video"],
    is_verified: true,
    created_at: "2026-02-10T10:00:00",
    updated_at: "2026-02-14T09:00:00",
    applicant_name: "Dr. Sara Mahmood",
    applicant_email: "demo.professional@mindora.local",
    applicant_is_active: true,
  },
  {
    id: "demo-application-3",
    user_id: "demo-account-hassan",
    approval_status: "rejected",
    license_number: "PSY-00917",
    specialization: "Counsellor",
    qualification: "MSc Counselling",
    bio: "Sample rejected application used to demonstrate the review tabs.",
    years_experience: 3,
    consultation_fee: "PKR 2,500",
    availability: null,
    consultation_types: ["chat"],
    is_verified: true,
    created_at: "2026-04-02T11:30:00",
    updated_at: "2026-04-05T15:20:00",
    applicant_name: "Hassan Raza",
    applicant_email: "hassan.demo@mindora.local",
    applicant_is_active: true,
  },
];

/* --------------------------------- State ---------------------------------- */

const state = {
  users: { ...demoUsers },
  directoryUsers,
  conversations,
  histories,
  moodRecords: buildMoodRecords(),
  assessmentCompleted: true,
  assessmentId: "6a1f2c3d-8e5b-4c7a-9d10-2f6b8a4c1e90",
  appointments,
  professionals,
  applications,
  notifications,
};

const lastDelivery = { fingerprint: "", at: 0 };

export function demoUserForRole(role: DemoRole): User {
  return state.users[role];
}

function currentRole(): DemoRole {
  return getDemoRole() ?? "user";
}

function currentUser(): User {
  return state.users[currentRole()];
}

function scopedAppointments(): Appointment[] {
  const role = currentRole();
  const me = currentUser();
  if (role === "professional") {
    return state.appointments.filter(
      (appointment) => appointment.professional_id === me.id,
    );
  }
  return state.appointments.filter(
    (appointment) => appointment.patient_id === me.id,
  );
}

function scopedNotifications(): AppNotification[] {
  const role = currentRole();
  return state.notifications
    .filter((notification) => notification.audience === role)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 50)
    .map(({ audience: _audience, ...notification }) => notification);
}

/* -------------------------------- Responses ------------------------------- */

function response<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status >= 200 && status < 300 ? "OK" : "Error",
    headers: new AxiosHeaders({ "content-type": "application/json" }),
    config,
    request: null,
  };
}

function failure(
  config: InternalAxiosRequestConfig,
  status: number,
  detail: string,
): Promise<never> {
  const reply = response(config, { detail }, status);
  return Promise.reject(
    new AxiosError(
      detail,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      reply,
    ),
  );
}

function body<T>(config: InternalAxiosRequestConfig): T {
  if (typeof config.data === "string") {
    try {
      return JSON.parse(config.data) as T;
    } catch {
      return {} as T;
    }
  }
  return (config.data ?? {}) as T;
}

function params(config: InternalAxiosRequestConfig): Record<string, unknown> {
  return (config.params ?? {}) as Record<string, unknown>;
}

/* --------------------------- Availability slots --------------------------- */

function availabilityFor(
  professionalId: string,
  day: string,
  durationMinutes: number,
): ProfessionalAvailability {
  const slots: ProfessionalAvailability["slots"] = [];
  const today = localDayString();
  const current = new Date();
  const base = new Date(`${day}T00:00:00`);
  const earliest =
    day === today
      ? Math.max(9 * 60, current.getHours() * 60 + current.getMinutes() + 45)
      : 9 * 60;

  for (
    let minutes = earliest;
    minutes + durationMinutes <= 21 * 60 && slots.length < 8;
    minutes += durationMinutes
  ) {
    const start = new Date(base);
    start.setHours(0, minutes, 0, 0);
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    slots.push({
      start: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      end: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
      start_utc: iso(start),
    });
  }

  return {
    professional_id: professionalId,
    date: day,
    timezone: viewerTimezone(),
    slot_minutes: durationMinutes,
    slots,
  };
}

/* ------------------------------- Admin data ------------------------------- */

const analytics: AdminAnalyticsSummary = {
  users: {
    total: 42,
    active: 39,
    inactive: 3,
    by_role: { user: 34, professional: 6, admin: 2 },
  },
  professionals: {
    total: 6,
    verified: 5,
    active: 5,
    by_approval_status: { approved: 5, pending: 1, rejected: 0 },
  },
  appointments: {
    total: 18,
    by_status: { pending: 3, confirmed: 6, cancelled: 2, completed: 7 },
  },
  assessments: { total: 26, completed: 21, in_progress: 5 },
  mood_records: { total: 128 },
};

function dailySeries(
  days: number,
  base: number,
  wave: number,
  offset = 0,
): AdminReportDailyPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const value = Math.max(
      0,
      Math.round(
        base +
          Math.sin((index + offset) / 3.2) * wave +
          ((index + offset) % 4 === 0 ? 1 : 0),
      ),
    );
    return {
      date: daysAgoString(days - 1 - index),
      count: value,
    };
  });
}

function sumSeries(series: AdminReportDailyPoint[]): number {
  return series.reduce((total, point) => total + point.count, 0);
}

function buildReport(days: number): AdminReportSummary {
  // Kept deliberately below the overview totals so the synthetic admin
  // screens tell one consistent story.
  const signups = dailySeries(days, 0.5, 0.6);
  const booked = dailySeries(days, 0.35, 0.45, 2);
  const assessmentsDaily = dailySeries(days, 0.5, 0.4, 1);
  const moodDaily = dailySeries(days, 3.4, 1.6, 3);
  const started = sumSeries(assessmentsDaily);
  const completed = Math.round(started * 0.81);
  const sent = Math.round(sumSeries(moodDaily) / 2) + 14;
  const read = Math.round(sent * 0.64);

  return {
    period: { days, start: daysAgoString(days - 1), end: localDayString() },
    user_signups: { total: sumSeries(signups), daily: signups },
    appointments: {
      booked: sumSeries(booked),
      by_status: {
        pending: Math.round(sumSeries(booked) * 0.2),
        confirmed: Math.round(sumSeries(booked) * 0.45),
        cancelled: Math.round(sumSeries(booked) * 0.1),
        completed: Math.round(sumSeries(booked) * 0.25),
      },
      by_type: {
        chat: Math.round(sumSeries(booked) * 0.4),
        audio: Math.round(sumSeries(booked) * 0.25),
        video: Math.round(sumSeries(booked) * 0.35),
      },
      daily: booked,
    },
    assessments: {
      started,
      completed,
      completion_rate: started ? completed / started : 0,
      by_type: {
        initial: { started, completed },
      },
      daily: assessmentsDaily,
    },
    mood_checkins: { total: sumSeries(moodDaily), daily: moodDaily },
    notifications: {
      sent,
      read,
      unread: sent - read,
      read_rate: sent ? read / sent : 0,
    },
  };
}

/* ------------------------------- Chat helpers ----------------------------- */

function conversationHistory(id: string): ConversationHistory | null {
  const summary = state.conversations.find((item) => item.id === id);
  const messages = state.histories[id];
  if (!summary || !messages) return null;
  return {
    id: summary.id,
    title: summary.title,
    started_at: summary.started_at,
    messages,
  };
}

function replyTo(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("sleep") || normalized.includes("night")) {
    return (
      "Nights can make everything feel louder. A small wind-down — dim lights, a warm drink, and one slow breath at a time — might help your body understand that the day is closing."
    );
  }
  if (normalized.includes("anxious") || normalized.includes("worry")) {
    return (
      "Worry often asks to be solved all at once. We could separate what is happening now from what your mind is predicting. What is the next small, concrete step you can see?"
    );
  }
  if (normalized.includes("tired") || normalized.includes("exhaust")) {
    return (
      "Tiredness is information, not a failure. Is there one demand you could soften or postpone today, even slightly?"
    );
  }
  return AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
}

/* ------------------------------ Route handlers ---------------------------- */

export async function handleDemoRequest(
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> {
  await sleep(90);

  const rawUrl = config.url ?? "";
  const path = rawUrl
    .replace(/^https?:\/\/[^/]+/, "")
    .split("?")[0]
    .replace(/^\/api\/v1/, "")
    .replace(/\/+$/, "");
  const method = (config.method ?? "get").toLowerCase();

  /* Auth endpoints cannot perform real work in demo mode. */
  if (
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/forgot-password") ||
    path.startsWith("/auth/reset-password") ||
    path.startsWith("/auth/verify-email")
  ) {
    return failure(
      config,
      400,
      "Demo mode is active. Use the demo role switcher, or exit the demo to use real authentication.",
    );
  }

  if (path === "/auth/logout") {
    return response(config, { message: "Demo session ended." });
  }

  /* Users */
  if (path === "/users/me" && method === "get") {
    return response(config, currentUser());
  }

  if (path === "/users/me" && method === "put") {
    const input = body<{
      full_name?: string;
      phone?: string;
      timezone?: string;
    }>(config);
    const me = currentUser();
    const updated: User = {
      ...me,
      full_name: input.full_name?.trim() || me.full_name,
      profile: {
        phone: input.phone?.trim() ? input.phone.trim() : null,
        timezone: input.timezone ?? me.profile?.timezone ?? null,
      },
    };
    state.users[currentRole()] = updated;
    const directoryIndex = state.directoryUsers.findIndex(
      (person) => person.id === updated.id,
    );
    if (directoryIndex >= 0) state.directoryUsers[directoryIndex] = updated;
    return response(config, updated);
  }

  if (path === "/users/me/setup-status") {
    return response(config, { profile_completed: Boolean(currentUser().profile) });
  }

  if (path === "/users" && method === "get") {
    return response(config, state.directoryUsers);
  }

  const roleMatch = path.match(/^\/users\/([^/]+)\/role$/);
  if (roleMatch && method === "patch") {
    const target = state.directoryUsers.find(
      (person) => person.id === roleMatch[1],
    );
    if (!target) return failure(config, 404, "Account not found.");
    const input = body<{ role?: User["role"] }>(config);
    if (!input.role) return failure(config, 400, "A role is required.");
    target.role = input.role;
    return response(config, target);
  }

  const userMatch = path.match(/^\/users\/([^/]+)$/);
  if (userMatch && method === "patch") {
    const target = state.directoryUsers.find(
      (person) => person.id === userMatch[1],
    );
    if (!target) return failure(config, 404, "Account not found.");
    const input = body<{ is_active?: boolean; is_verified?: boolean }>(config);
    if (typeof input.is_active === "boolean") target.is_active = input.is_active;
    if (typeof input.is_verified === "boolean") {
      target.is_verified = input.is_verified;
    }
    return response(config, target);
  }

  /* Chat */
  if (path === "/chat" && method === "post") {
    const input = body<{ message?: string; conversation_id?: string | null }>(
      config,
    );
    const text = String(input.message ?? "").trim();
    if (!text) return failure(config, 422, "A message is required.");

    let conversationId = input.conversation_id ?? null;
    if (conversationId && !state.histories[conversationId]) {
      return failure(config, 404, "This conversation is no longer available.");
    }

    const timestamp = nowIso();
    const userMessage: ChatMessage = {
      id: `demo-msg-${Date.now()}`,
      sender: "user",
      content: text,
      created_at: timestamp,
    };
    const aiMessage: ChatMessage = {
      id: `demo-msg-${Date.now() + 1}`,
      sender: "ai",
      content: replyTo(text),
      created_at: timestamp,
    };

    if (!conversationId) {
      conversationId = `demo-conv-${Date.now()}`;
      state.conversations.unshift({
        id: conversationId,
        title: text.length > 46 ? `${text.slice(0, 46)}…` : text,
        started_at: timestamp,
      });
      state.histories[conversationId] = [];
    }

    state.histories[conversationId] = [
      ...(state.histories[conversationId] ?? []),
      userMessage,
      aiMessage,
    ];
    if (state.conversations.length > 30) state.conversations.pop();

    const reply: ChatResponse = {
      conversation_id: conversationId,
      user_message: userMessage,
      ai_response: aiMessage,
    };
    return response(config, reply);
  }

  if (path === "/chat/conversations" && method === "get") {
    return response(config, state.conversations);
  }

  const historyMatch = path.match(/^\/chat\/history\/([^/]+)$/);
  if (historyMatch && method === "get") {
    const history = conversationHistory(historyMatch[1]);
    if (!history) {
      return failure(config, 404, "This conversation is no longer available.");
    }
    return response(config, history);
  }

  /* Mood */
  if (path === "/mood" && method === "post") {
    const input = body<{ mood_score?: number; note?: string | null }>(config);
    const score = Number(input.mood_score);
    if (!Number.isFinite(score) || score < 1 || score > 10) {
      return failure(config, 422, "Mood score must be between 1 and 10.");
    }
    const today = localDayString();
    const timestamp = nowIso();
    const existing = state.moodRecords.find(
      (record) => record.mood_date === today,
    );
    let record: MoodRecord;
    if (existing) {
      existing.mood_score = Math.round(score);
      existing.note = input.note?.trim() ? input.note.trim() : null;
      existing.updated_at = timestamp;
      record = existing;
    } else {
      record = {
        id: `demo-mood-${today}`,
        mood_score: Math.round(score),
        mood_label: null,
        note: input.note?.trim() ? input.note.trim() : null,
        mood_date: today,
        created_at: timestamp,
        updated_at: timestamp,
      };
      state.moodRecords.push(record);
    }
    return response(config, record);
  }

  if (path === "/mood/today" && method === "get") {
    return response(
      config,
      state.moodRecords.find(
        (record) => record.mood_date === localDayString(),
      ) ?? null,
    );
  }

  if (path === "/mood/summary" && method === "get") {
    return response(config, buildMoodSummary(state.moodRecords));
  }

  /* Assessment */
  if (path === "/assessment/status" && method === "get") {
    const status: AssessmentStatus = {
      completed: state.assessmentCompleted,
      assessment_id: state.assessmentId,
      assessment_type: "initial",
    };
    return response(config, status);
  }

  if (path === "/assessment/instruments" && method === "get") {
    return response(config, instruments);
  }

  if (path === "/assessment/start" && method === "post") {
    const session: AssessmentSession = {
      assessment_id: "b4c7d2e9-3f1a-4b8c-9e5d-7a2c6f1d3b48",
      assessment_type: "initial_screening",
      status: "in_progress",
      questions: assessmentQuestions(),
    };
    state.assessmentId = session.assessment_id;
    return response(config, session);
  }

  const submitMatch = path.match(/^\/assessment\/([^/]+)\/submit$/);
  if (submitMatch && method === "post") {
    state.assessmentCompleted = true;
    state.assessmentId = submitMatch[1];
    const result: AssessmentResult = {
      assessment_id: submitMatch[1],
      total_score: 23,
      severity_level: "mild",
      interpretation:
        "Demo result: these answers suggest a mild level of recent distress. This is synthetic sample output, not a real screening result or a diagnosis.",
      result_data: {
        overall: { level: "mild" },
        who5: { percentage_score: 52, raw_score: 13, level: "moderate" },
        gad7: { total_score: 8, severity_level: "mild" },
        mood: { score: 1, level: "mild" },
        stress: { score: 2, level: "moderate" },
        safety: { risk_flag: false },
      },
    };
    return response(config, result);
  }

  /* Appointments */
  if (path === "/appointments/me" && method === "get") {
    return response(config, scopedAppointments());
  }

  if (path === "/appointments/admin" && method === "get") {
    return response(config, state.appointments);
  }

  if (path === "/appointments" && method === "post") {
    const input = body<{
      professional_id?: string;
      scheduled_at?: string;
      duration_minutes?: number;
      appointment_type?: Appointment["appointment_type"];
    }>(config);
    const professional = state.professionals.find(
      (item) => item.id === input.professional_id,
    );
    if (!professional) return failure(config, 404, "Professional not found.");
    if (!input.scheduled_at) {
      return failure(config, 422, "A time slot is required.");
    }
    const created: Appointment = {
      id: `demo-appt-${Date.now()}`,
      patient_id: demoUsers.user.id,
      professional_id: professional.id,
      scheduled_at: input.scheduled_at,
      duration_minutes: input.duration_minutes ?? 30,
      appointment_type: input.appointment_type ?? "chat",
      status: "pending",
      created_at: nowIso(),
      meeting_url: null,
      professional_name: professional.full_name,
      specialization: professional.specialization,
      patient_name: demoUsers.user.full_name,
    };
    state.appointments.unshift(created);
    return response(config, created, 201);
  }

  const appointmentActionMatch = path.match(
    /^\/appointments\/([^/]+)\/(cancel|confirm|meeting-link)$/,
  );
  if (appointmentActionMatch && method === "patch") {
    const appointment = state.appointments.find(
      (item) => item.id === appointmentActionMatch[1],
    );
    if (!appointment) return failure(config, 404, "Appointment not found.");
    const action = appointmentActionMatch[2];
    if (action === "cancel") appointment.status = "cancelled";
    if (action === "confirm") appointment.status = "confirmed";
    if (action === "meeting-link") {
      const input = body<{ meeting_url?: string }>(config);
      appointment.meeting_url = input.meeting_url?.trim() ?? null;
    }
    return response(config, appointment);
  }

  const appointmentMatch = path.match(/^\/appointments\/([^/]+)$/);
  if (appointmentMatch && method === "get") {
    const appointment = state.appointments.find(
      (item) => item.id === appointmentMatch[1],
    );
    if (!appointment) return failure(config, 404, "Appointment not found.");
    return response(config, appointment);
  }

  /* Professionals (admin routes first) */
  if (path === "/professionals/admin/applications" && method === "get") {
    const status = params(config).status as
      | ProfessionalApprovalStatus
      | undefined;
    return response(
      config,
      status
        ? state.applications.filter(
            (application) => application.approval_status === status,
          )
        : state.applications,
    );
  }

  const reviewMatch = path.match(
    /^\/professionals\/admin\/applications\/([^/]+)\/(approve|reject|deactivate|reactivate)$/,
  );
  if (reviewMatch && method === "patch") {
    const application = state.applications.find(
      (item) => item.id === reviewMatch[1],
    );
    if (!application) return failure(config, 404, "Application not found.");
    const action = reviewMatch[2];
    if (action === "approve") application.approval_status = "approved";
    if (action === "reject") application.approval_status = "rejected";
    if (action === "deactivate") application.applicant_is_active = false;
    if (action === "reactivate") application.applicant_is_active = true;
    application.updated_at = nowIso();
    return response(config, application);
  }

  const availabilityMatch = path.match(
    /^\/professionals\/([^/]+)\/availability$/,
  );
  if (availabilityMatch && method === "get") {
    const query = params(config);
    const day =
      typeof query.date === "string" && query.date
        ? query.date
        : localDayString();
    const duration = Number(query.duration_minutes) || 30;
    return response(
      config,
      availabilityFor(availabilityMatch[1], day, duration),
    );
  }

  if (path === "/professionals" && method === "get") {
    return response(config, state.professionals);
  }

  const professionalMatch = path.match(/^\/professionals\/([^/]+)$/);
  if (professionalMatch && method === "get") {
    const professional = state.professionals.find(
      (item) => item.id === professionalMatch[1],
    );
    if (!professional) return failure(config, 404, "Professional not found.");
    return response(config, professional);
  }

  /* Notifications */
  if (path === "/notifications" && method === "get") {
    return response(config, scopedNotifications());
  }

  if (
    path === "/notifications/process-mood-reminders" &&
    method === "post"
  ) {
    return response(config, { processed: 0 });
  }

  const readMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
  if (readMatch && method === "patch") {
    const notification = state.notifications.find(
      (item) => item.id === readMatch[1],
    );
    if (!notification) return failure(config, 404, "Notification not found.");
    notification.is_read = true;
    return response(config, notification);
  }

  /* Admin */
  if (path === "/admin/analytics/summary" && method === "get") {
    return response(config, analytics);
  }

  if (path === "/admin/reports/summary" && method === "get") {
    const requested = Number(params(config).days) || 30;
    const days = Math.min(90, Math.max(1, Math.round(requested)));
    return response(config, buildReport(days));
  }

  if (path === "/admin/content/broadcast/preview" && method === "post") {
    const input = body<{
      recipient_mode?: "all" | "role" | "user_ids";
      role?: string | null;
      user_ids?: string[] | null;
    }>(config);
    const ids = input.user_ids ?? [];
    const count =
      input.recipient_mode === "user_ids"
        ? ids.length
        : input.recipient_mode === "role"
          ? 5
          : 39;
    return response(config, {
      recipient_mode: input.recipient_mode ?? "all",
      role: input.role ?? null,
      total_recipients: count,
      by_role: {},
    });
  }


  if (path === "/admin/content/broadcast" && method === "post") {
    const input = body<{ title?: string; content?: string; force?: boolean; user_ids?: string[] | null }>(config);
    const fingerprint = JSON.stringify([
      input.title ?? "",
      input.content ?? "",
    ]);
    if (
      !input.force &&
      fingerprint === lastDelivery.fingerprint &&
      Date.now() - lastDelivery.at < 600000
    ) {
      return failure(
        config,
        409,
        "An identical message was delivered recently. Confirm the repeat to continue.",
      );
    }
    lastDelivery.fingerprint = fingerprint;
    lastDelivery.at = Date.now();
    const count = (input.user_ids ?? []).length || 39;
    return response(config, {
      title: input.title ?? "",
      recipient_mode: "all",
      role: null,
      recipients_targeted: count,
      notifications_created: count,
      forced: Boolean(input.force),
      channel: "in_app",
    });
  }

  return failure(
    config,
    404,
    `Demo mode has no fixture for ${method.toUpperCase()} ${path || "/"}.`,
  );
}
