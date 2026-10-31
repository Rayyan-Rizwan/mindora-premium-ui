import { api } from "./client";
import type {
  AssessmentInstrument,
  AssessmentResult,
  AssessmentSession,
  AssessmentStatus,
} from "@/types";

export async function fetchAssessmentStatus() {
  const response = await api.get<AssessmentStatus>("/assessment/status");
  return response.data;
}

export async function fetchInstruments() {
  const response =
    await api.get<AssessmentInstrument[]>("/assessment/instruments");
  return response.data;
}

export async function startAssessment() {
  const response = await api.post<AssessmentSession>("/assessment/start", {});
  return response.data;
}

export async function submitAssessment(
  assessmentId: string,
  answers: { question_code: string; answer_value: number }[],
) {
  const response = await api.post<AssessmentResult>(
    `/assessment/${assessmentId}/submit`,
    { answers },
  );
  return response.data;
}
