import type { AssessmentQuestion } from "@/types";

export const SECTION_META: Record<
  string,
  { title: string; description: string; note?: string }
> = {
  WHO5: {
    title: "Wellbeing",
    description:
      "Over the last two weeks, how much of the time has each statement felt true for you?",
    note: "WHO-5 Well-Being Index",
  },
  GAD7: {
    title: "Anxiety",
    description:
      "Over the last two weeks, how often have you been bothered by the following?",
    note: "GAD-7",
  },
  MOOD: {
    title: "Mood",
    description: "A little context about how recent weeks have felt.",
  },
  STRESS: {
    title: "Stress",
    description: "How often daily demands have felt like too much.",
  },
  SAFETY: {
    title: "Safety",
    description:
      "One direct question, asked with care. Your answer helps the platform point you toward the right kind of support.",
    note: "A screening question, not a diagnosis",
  },
};

export interface AssessmentSection {
  key: string;
  title: string;
  description: string;
  note?: string;
  questions: AssessmentQuestion[];
}

function sectionKey(code: string): string {
  return code.split("_")[0] ?? code;
}

export function buildSections(
  questions: AssessmentQuestion[],
): AssessmentSection[] {
  const order: string[] = [];
  const groups = new Map<string, AssessmentQuestion[]>();

  for (const question of questions) {
    const key = sectionKey(question.code);
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(question);
  }

  return order.map((key) => {
    const meta = SECTION_META[key] ?? {
      title: key.replace(/_/g, " "),
      description: "Answer each statement as honestly as you can.",
    };
    return {
      key,
      title: meta.title,
      description: meta.description,
      note: meta.note,
      questions: groups.get(key) ?? [],
    };
  });
}

export function asRecord(
  value: unknown,
): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function numberFrom(
  record: Record<string, unknown> | null,
  key: string,
): number | null {
  const value = record?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function stringFrom(
  record: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = record?.[key];
  return typeof value === "string" && value ? value : null;
}

export function prettyLevel(value: string | null): string {
  if (!value) return "Not recorded";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
