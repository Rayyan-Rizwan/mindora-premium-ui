import { api } from "./client";
import type {
  Appointment,
  AppointmentCreateRequest,
  Professional,
  ProfessionalApplication,
  ProfessionalApprovalStatus,
  ProfessionalAvailability,
} from "@/types";

export async function fetchMyAppointments() {
  const response = await api.get<Appointment[]>("/appointments/me");
  return response.data;
}

export async function fetchAppointment(id: string) {
  const response = await api.get<Appointment>(`/appointments/${id}`);
  return response.data;
}

export async function bookAppointment(input: AppointmentCreateRequest) {
  const response = await api.post<Appointment>("/appointments", input);
  return response.data;
}

export async function cancelAppointment(id: string) {
  const response = await api.patch<Appointment>(
    `/appointments/${id}/cancel`,
  );
  return response.data;
}

export async function confirmAppointment(id: string) {
  const response = await api.patch<Appointment>(
    `/appointments/${id}/confirm`,
  );
  return response.data;
}

export async function setAppointmentMeetingLink(
  id: string,
  meetingUrl: string,
) {
  const response = await api.patch<Appointment>(
    `/appointments/${id}/meeting-link`,
    { meeting_url: meetingUrl },
  );
  return response.data;
}

export async function fetchAllAppointments() {
  const response = await api.get<Appointment[]>("/appointments/admin");
  return response.data;
}

export async function fetchProfessionals(params?: {
  search?: string;
  specialization?: string;
}) {
  const response = await api.get<Professional[]>("/professionals", { params });
  return response.data;
}

export async function fetchProfessional(id: string) {
  const response = await api.get<Professional>(`/professionals/${id}`);
  return response.data;
}

export async function fetchAvailability(
  professionalId: string,
  date: string,
  durationMinutes = 30,
) {
  const response = await api.get<ProfessionalAvailability>(
    `/professionals/${professionalId}/availability`,
    { params: { date, duration_minutes: durationMinutes } },
  );
  return response.data;
}

export async function fetchApplications(status: ProfessionalApprovalStatus) {
  const response = await api.get<ProfessionalApplication[]>(
    "/professionals/admin/applications",
    { params: { status } },
  );
  return response.data;
}

export async function reviewApplication(
  professionalId: string,
  action: "approve" | "reject" | "deactivate" | "reactivate",
) {
  const response = await api.patch<ProfessionalApplication>(
    `/professionals/admin/applications/${professionalId}/${action}`,
  );
  return response.data;
}
