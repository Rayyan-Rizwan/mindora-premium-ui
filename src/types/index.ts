export type UserRole = "user" | "professional" | "admin";

export interface UserProfileInfo {
  phone: string | null;
  timezone: string | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  is_protected: boolean;
  created_at: string;
  profile: UserProfileInfo | null;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  expires_in: number;
}

export interface AuthMessage {
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  content: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  conversation_id: string | null;
}

export interface ChatResponse {
  conversation_id: string;
  user_message: ChatMessage;
  ai_response: ChatMessage;
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  started_at: string;
}

export interface ConversationHistory {
  id: string;
  title: string | null;
  started_at: string;
  messages: ChatMessage[];
}

export interface MoodRecord {
  id: string;
  mood_score: number;
  mood_label: string | null;
  note: string | null;
  mood_date: string;
  created_at: string;
  updated_at: string;
}

export interface MoodSummary {
  period: { start_date: string; end_date: string };
  statistics: {
    average_mood: number | null;
    highest_mood: number | null;
    lowest_mood: number | null;
    total_check_ins: number;
  };
  trends: {
    current_7_day_average: number | null;
    previous_7_day_average: number | null;
    weekly_change: number | null;
    overall_average: number | null;
    current_streak: number;
    missing_days_last_7_days: number;
  };
  moods: { date: string; score: number }[];
}

export interface AssessmentOption {
  label: string;
  value: number;
}

export interface AssessmentQuestion {
  code: string;
  question: string;
  options: AssessmentOption[];
}

export interface AssessmentSession {
  assessment_id: string;
  assessment_type: string;
  status: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentResult {
  assessment_id: string;
  total_score: number;
  severity_level: string;
  interpretation: string;
  result_data: Record<string, unknown>;
}

export interface AssessmentStatus {
  completed: boolean;
  assessment_id: string | null;
  assessment_type: string;
}

export interface AssessmentInstrument {
  code: string;
  name: string;
  description: string;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type AppointmentType = "chat" | "audio" | "video";

export interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  scheduled_at: string;
  duration_minutes: number;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  created_at: string;
  meeting_url: string | null;
  professional_name: string | null;
  specialization: string | null;
  patient_name: string | null;
}

export interface AppointmentCreateRequest {
  professional_id: string;
  scheduled_at: string;
  duration_minutes: number;
  appointment_type: AppointmentType;
}

export type WeeklySchedule = Record<string, { start: string; end: string }[]>;

export interface Professional {
  id: string;
  full_name: string;
  specialization: string;
  qualification: string | null;
  bio: string | null;
  years_experience: number;
  consultation_fee: string | number;
  availability: WeeklySchedule | null;
  consultation_types: AppointmentType[] | null;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  start_utc: string;
}

export interface ProfessionalAvailability {
  professional_id: string;
  date: string;
  timezone: string;
  slot_minutes: number;
  slots: AvailabilitySlot[];
}

export type NotificationType =
  | "system"
  | "appointment"
  | "assessment_reminder"
  | "risk_alert"
  | "message"
  | "motivational"
  | "mood_reminder"
  | "low_mood_followup"
  | "ai_check_in";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  content: string | null;
  is_read: boolean;
  created_at: string;
  appointment_id: string | null;
}

export interface AdminAnalyticsSummary {
  users: {
    total: number;
    active: number;
    inactive: number;
    by_role: Record<string, number>;
  };
  professionals: {
    total: number;
    verified: number;
    active: number;
    by_approval_status: Record<string, number>;
  };
  appointments: {
    total: number;
    by_status: Record<string, number>;
  };
  assessments: {
    total: number;
    completed: number;
    in_progress: number;
  };
  mood_records: { total: number };
}

export interface AdminReportDailyPoint {
  date: string;
  count: number;
}

export interface AdminReportSummary {
  period: { days: number; start: string; end: string };
  user_signups: { total: number; daily: AdminReportDailyPoint[] };
  appointments: {
    booked: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    daily: AdminReportDailyPoint[];
  };
  assessments: {
    started: number;
    completed: number;
    completion_rate: number;
    by_type: Record<string, { started: number; completed: number }>;
    daily: AdminReportDailyPoint[];
  };
  mood_checkins: { total: number; daily: AdminReportDailyPoint[] };
  notifications: {
    sent: number;
    read: number;
    unread: number;
    read_rate: number;
  };
}

export type ProfessionalApprovalStatus = "pending" | "approved" | "rejected";

export interface ProfessionalApplication {
  id: string;
  user_id: string;
  approval_status: ProfessionalApprovalStatus;
  license_number: string;
  specialization: string;
  qualification: string | null;
  bio: string | null;
  years_experience: number;
  consultation_fee: string | number;
  availability: WeeklySchedule | null;
  consultation_types: AppointmentType[] | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string | null;
  applicant_name: string | null;
  applicant_email: string | null;
  applicant_is_active: boolean | null;
}
