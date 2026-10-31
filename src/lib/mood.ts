export type MoodTone =
  | "very-low"
  | "low"
  | "okay"
  | "good"
  | "great";

export interface MoodDescriptor {
  label: string;
  tone: MoodTone;
  hint: string;
}

/**
 * Presentation mapping only. The backend stores a 1–10 score and does not
 * compute a label, so these words are UI copy — not a clinical interpretation.
 */
export function describeMood(score: number): MoodDescriptor {
  if (score <= 2) {
    return {
      label: "Very low",
      tone: "very-low",
      hint: "A heavy day. You don’t have to carry it alone.",
    };
  }
  if (score <= 4) {
    return {
      label: "Low",
      tone: "low",
      hint: "Things feel tender today. Small steps count.",
    };
  }
  if (score <= 6) {
    return {
      label: "Okay",
      tone: "okay",
      hint: "A steady middle. Thank you for checking in.",
    };
  }
  if (score <= 8) {
    return {
      label: "Good",
      tone: "good",
      hint: "There’s some light today. Let’s notice it.",
    };
  }
  return {
    label: "Great",
    tone: "great",
    hint: "A brighter day. We’re glad you’re here.",
  };
}

export const MOOD_SCALE = Array.from({ length: 10 }, (_, index) => {
  const score = index + 1;
  return { score, ...describeMood(score) };
});

export interface MoodBand {
  tone: MoodTone;
  label: string;
  range: string;
  /** Representative score stored when someone picks the face instead of a digit. */
  anchor: number;
  description: string;
}

export const MOOD_BANDS: MoodBand[] = [
  {
    tone: "very-low",
    label: "Very low",
    range: "1–2",
    anchor: 2,
    description: "Heavy, drained, or overwhelmed",
  },
  {
    tone: "low",
    label: "Low",
    range: "3–4",
    anchor: 4,
    description: "Tender, tired, or uneasy",
  },
  {
    tone: "okay",
    label: "Okay",
    range: "5–6",
    anchor: 6,
    description: "Steady, somewhere in the middle",
  },
  {
    tone: "good",
    label: "Good",
    range: "7–8",
    anchor: 8,
    description: "Settled, with some light",
  },
  {
    tone: "great",
    label: "Great",
    range: "9–10",
    anchor: 10,
    description: "Bright, warm, or buoyant",
  },
];

export function bandForScore(score: number): MoodBand {
  if (score <= 2) return MOOD_BANDS[0];
  if (score <= 4) return MOOD_BANDS[1];
  if (score <= 6) return MOOD_BANDS[2];
  if (score <= 8) return MOOD_BANDS[3];
  return MOOD_BANDS[4];
}
