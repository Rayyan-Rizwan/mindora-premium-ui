export type RelaxCategory =
  | "instrumental"
  | "meditation"
  | "breathing"
  | "ambient"
  | "nature"
  | "sleep";

export interface TrackSound {
  root: number;
  scale: number[];
  tempo: number;
  brightness: number;
  noise: number;
  padLevel: number;
  chimeLevel: number;
}

export interface RelaxTrack {
  id: string;
  title: string;
  description: string;
  category: RelaxCategory;
  duration: number;
  tone: string;
  sound: TrackSound;
}

export const RELAX_CATEGORIES: {
  value: RelaxCategory | "all";
  label: string;
  hint: string;
}[] = [
  { value: "all", label: "All", hint: "Every piece" },
  { value: "instrumental", label: "Instrumental", hint: "Gentle tone studies" },
  { value: "meditation", label: "Meditation", hint: "Slow, spacious drones" },
  { value: "breathing", label: "Breathing", hint: "Steady, unhurried pulses" },
  { value: "ambient", label: "Ambient", hint: "Soft, drifting textures" },
  { value: "nature", label: "Nature", hint: "Ocean, forest and open air" },
  { value: "sleep", label: "Sleep & rest", hint: "Low, quiet washes" },
];

export const CATEGORY_LABEL: Record<RelaxCategory, string> = {
  instrumental: "Instrumental",
  meditation: "Meditation",
  breathing: "Breathing",
  ambient: "Ambient",
  nature: "Nature",
  sleep: "Sleep & rest",
};

export const RELAX_TRACKS: RelaxTrack[] = [
  {
    id: "linen-light",
    title: "Linen Light",
    description:
      "Warm sine tones and a slow filter drift, like afternoon light across a quiet room.",
    category: "ambient",
    duration: 480,
    tone: "linear-gradient(135deg, #cbb8ea 0%, #9c8ad8 55%, #6e5aa5 100%)",
    sound: {
      root: 220,
      scale: [0, 2, 4, 7, 9],
      tempo: 5.4,
      brightness: 1500,
      noise: 0.035,
      padLevel: 0.22,
      chimeLevel: 0.06,
    },
  },
  {
    id: "quiet-harbour",
    title: "Quiet Harbour",
    description:
      "A minor-pentatonic study with soft bell notes over a low, held pad.",
    category: "instrumental",
    duration: 420,
    tone: "linear-gradient(135deg, #b8c9e6 0%, #8fa8cf 55%, #5d648f 100%)",
    sound: {
      root: 196,
      scale: [0, 3, 5, 7, 10],
      tempo: 4.2,
      brightness: 1150,
      noise: 0.03,
      padLevel: 0.2,
      chimeLevel: 0.07,
    },
  },
  {
    id: "evening-tide",
    title: "Evening Tide",
    description:
      "Low, slowly breathing chords for the end of the day. Keep the volume gentle.",
    category: "sleep",
    duration: 600,
    tone: "linear-gradient(135deg, #b7d3c2 0%, #7fa891 55%, #4c6f5c 100%)",
    sound: {
      root: 146.83,
      scale: [0, 3, 7, 10],
      tempo: 7,
      brightness: 820,
      noise: 0.045,
      padLevel: 0.24,
      chimeLevel: 0.05,
    },
  },
  {
    id: "soft-landing",
    title: "Soft Landing",
    description:
      "An unhurried pulse that can accompany a slow breathing practice.",
    category: "breathing",
    duration: 360,
    tone: "linear-gradient(135deg, #f2c8b4 0%, #dba88f 55%, #a97f6d 100%)",
    sound: {
      root: 174.61,
      scale: [0, 2, 5, 7],
      tempo: 6,
      brightness: 1000,
      noise: 0.025,
      padLevel: 0.19,
      chimeLevel: 0.06,
    },
  },
  {
    id: "still-point",
    title: "Still Point",
    description:
      "A sparse drone with long gaps and a narrow harmonic range.",
    category: "meditation",
    duration: 540,
    tone: "linear-gradient(135deg, #d6c8f0 0%, #b09fd8 55%, #665293 100%)",
    sound: {
      root: 130.81,
      scale: [0, 5, 7, 12],
      tempo: 8.2,
      brightness: 720,
      noise: 0.02,
      padLevel: 0.26,
      chimeLevel: 0.045,
    },
  },
  {
    id: "pale-meadow",
    title: "Pale Meadow",
    description:
      "A major-pentatonic wash with small, scattered notes and plenty of space.",
    category: "instrumental",
    duration: 390,
    tone: "linear-gradient(135deg, #f8eedf 0%, #e6d3b8 55%, #b99c78 100%)",
    sound: {
      root: 261.63,
      scale: [0, 2, 4, 7, 9],
      tempo: 3.6,
      brightness: 1650,
      noise: 0.028,
      padLevel: 0.17,
      chimeLevel: 0.055,
    },
  },
  {
    id: "night-drift",
    title: "Night Drift",
    description:
      "A low ambient bed with a slightly open scale and very slow movement.",
    category: "ambient",
    duration: 510,
    tone: "linear-gradient(135deg, #9ba6d4 0%, #6f7cab 55%, #3f4768 100%)",
    sound: {
      root: 164.81,
      scale: [0, 2, 4, 6, 9],
      tempo: 6.4,
      brightness: 900,
      noise: 0.04,
      padLevel: 0.23,
      chimeLevel: 0.05,
    },
  },
  {
    id: "long-exhale",
    title: "Long Exhale",
    description:
      "Wide intervals and a slow tempo, written to leave room between sounds.",
    category: "breathing",
    duration: 450,
    tone: "linear-gradient(135deg, #d9e2ee 0%, #b3c4d8 55%, #7c93ad 100%)",
    sound: {
      root: 196,
      scale: [0, 2, 7, 9],
      tempo: 7.5,
      brightness: 980,
      noise: 0.03,
      padLevel: 0.21,
      chimeLevel: 0.045,
    },
  },
  {
    id: "moon-garden",
    title: "Moon Garden",
    description:
      "A quiet sleep-leaning piece with muffled highs and a soft noise floor.",
    category: "sleep",
    duration: 600,
    tone: "linear-gradient(135deg, #c3b2ea 0%, #8d7db8 55%, #544475 100%)",
    sound: {
      root: 146.83,
      scale: [0, 2, 3, 7, 10],
      tempo: 6.8,
      brightness: 760,
      noise: 0.05,
      padLevel: 0.25,
      chimeLevel: 0.04,
    },
  },
];

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
