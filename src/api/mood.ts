import { api } from "./client";
import type { MoodRecord, MoodSummary } from "@/types";

export async function saveMood(moodScore: number, note: string | null) {
  const response = await api.post<MoodRecord>("/mood", {
    mood_score: moodScore,
    note,
  });
  return response.data;
}

export async function fetchTodayMood() {
  const response = await api.get<MoodRecord | null>("/mood/today");
  return response.data;
}

export async function fetchMoodSummary() {
  const response = await api.get<MoodSummary>("/mood/summary");
  return response.data;
}
