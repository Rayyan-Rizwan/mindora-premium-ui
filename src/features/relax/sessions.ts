import {
  CATEGORY_LABEL,
  RELAX_TRACKS,
  type RelaxCategory,
  type RelaxTrack,
} from "./tracks";

/**
 * Curated sessions mirror the reference artwork and labels while reusing the
 * original generated sound profiles, so the existing nine-track catalog and
 * its stable IDs stay untouched.
 */

export type BreathPattern = "calm" | "box";
export type SessionKind = "breathing" | "audio";

export interface CuratedSession {
  id: string;
  title: string;
  durationLabel: string;
  minutes: number;
  category: RelaxCategory;
  kind: SessionKind;
  description: string;
  sourceId: string;
  pattern?: BreathPattern;
}

const baseSession = {
  kind: "audio" as const,
};

export const DEEP_BREATHING: CuratedSession = {
  ...baseSession,
  id: "deep-breathing",
  title: "Deep Breathing",
  durationLabel: "2–5 min",
  minutes: 5,
  category: "breathing",
  kind: "breathing",
  pattern: "calm",
  description:
    "A slow 4–4–4 rhythm that follows the circle, with a gentle pause between breaths.",
  sourceId: "soft-landing",
};

export const BOX_BREATHING: CuratedSession = {
  ...baseSession,
  id: "box-breathing",
  title: "Box Breathing",
  durationLabel: "3–5 min",
  minutes: 5,
  category: "breathing",
  kind: "breathing",
  pattern: "box",
  description:
    "Even four-count sides: inhale, hold, exhale and hold, used to steady a busy mind.",
  sourceId: "long-exhale",
};

export const MORNING_CALM: CuratedSession = {
  ...baseSession,
  id: "morning-calm",
  title: "Morning Calm",
  durationLabel: "10 min",
  minutes: 10,
  category: "meditation",
  description:
    "A spacious morning drone with soft bell notes, generated live in this browser.",
  sourceId: "still-point",
};

export const OCEAN_WAVES: CuratedSession = {
  ...baseSession,
  id: "ocean-waves",
  title: "Ocean Waves",
  durationLabel: "10 min",
  minutes: 10,
  category: "nature",
  description:
    "Slow tidal swells and a bright horizon, generated from an original water sound profile.",
  sourceId: "quiet-harbour",
};

export const EVENING_WIND_DOWN: CuratedSession = {
  ...baseSession,
  id: "evening-wind-down",
  title: "Evening Wind Down",
  durationLabel: "15 min",
  minutes: 15,
  category: "sleep",
  description:
    "Low, unhurried chords for the end of the day. Keep the volume gentle.",
  sourceId: "evening-tide",
};

export const FOREST_AMBIENCE: CuratedSession = {
  ...baseSession,
  id: "forest-ambience",
  title: "Forest Ambience",
  durationLabel: "10 min",
  minutes: 10,
  category: "nature",
  description:
    "A quiet canopy of soft tones, small chimes and a low forest floor.",
  sourceId: "pale-meadow",
};

export const RELAX_SESSIONS: CuratedSession[] = [
  DEEP_BREATHING,
  BOX_BREATHING,
  MORNING_CALM,
  OCEAN_WAVES,
  EVENING_WIND_DOWN,
];

export const MINDFUL_SESSIONS: CuratedSession[] = [
  OCEAN_WAVES,
  FOREST_AMBIENCE,
  MORNING_CALM,
  EVENING_WIND_DOWN,
];

const ALL_CURATED = [...RELAX_SESSIONS, FOREST_AMBIENCE];

export const CURATED_IDS = new Set(ALL_CURATED.map((session) => session.id));

export function findSession(id: string | null | undefined): CuratedSession | null {
  if (!id) return null;
  return ALL_CURATED.find((session) => session.id === id) ?? null;
}

function sourceTrack(id: string): RelaxTrack {
  return RELAX_TRACKS.find((track) => track.id === id) ?? RELAX_TRACKS[0];
}

export function toRelaxTrack(session: CuratedSession): RelaxTrack {
  const source = sourceTrack(session.sourceId);
  return {
    id: session.id,
    title: session.title,
    description: session.description,
    category: session.category,
    duration: session.minutes * 60,
    tone: source.tone,
    sound: source.sound,
  };
}

export const CURATED_TRACKS: RelaxTrack[] = ALL_CURATED.map(toRelaxTrack);

export function findMindfulTrack(
  id: string | null | undefined,
): RelaxTrack | null {
  const session = findSession(id);
  if (session) return toRelaxTrack(session);
  return RELAX_TRACKS.find((track) => track.id === id) ?? null;
}

export function trackDurationLabel(track: RelaxTrack): string {
  const session = findSession(track.id);
  if (session) return session.durationLabel;
  return `${Math.round(track.duration / 60)} min`;
}

export function trackMeta(track: RelaxTrack): string {
  return `${CATEGORY_LABEL[track.category]} · ${trackDurationLabel(track)}`;
}

export type RelaxFilter = "all" | "breathing" | "meditation" | "sounds" | "sleep";

export const RELAX_FILTERS: {
  value: RelaxFilter;
  label: string;
  categories?: RelaxCategory[];
}[] = [
  { value: "all", label: "All" },
  { value: "breathing", label: "Breathing", categories: ["breathing"] },
  { value: "meditation", label: "Meditation", categories: ["meditation"] },
  {
    value: "sounds",
    label: "Sounds",
    categories: ["nature", "ambient", "instrumental"],
  },
  { value: "sleep", label: "Sleep", categories: ["sleep"] },
];

export function sessionsForFilter(filter: RelaxFilter): CuratedSession[] {
  const entry = RELAX_FILTERS.find((item) => item.value === filter);
  const categories = entry?.categories;
  if (!categories) return RELAX_SESSIONS;
  return RELAX_SESSIONS.filter((session) =>
    categories.includes(session.category),
  );
}

export type SoundTab = "all" | "nature" | "ambient" | "sleep" | "instrumental";

export const SOUND_TABS: { value: SoundTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "nature", label: "Nature" },
  { value: "ambient", label: "Ambient" },
  { value: "sleep", label: "Sleep" },
  { value: "instrumental", label: "Instrumental" },
];

export function mindfulTracksFor(tab: SoundTab): RelaxTrack[] {
  switch (tab) {
    case "nature":
      return [toRelaxTrack(OCEAN_WAVES), toRelaxTrack(FOREST_AMBIENCE)];
    case "sleep":
      return [toRelaxTrack(EVENING_WIND_DOWN)];
    case "ambient":
      return RELAX_TRACKS.filter((track) => track.category === "ambient");
    case "instrumental":
      return RELAX_TRACKS.filter((track) => track.category === "instrumental");
    default:
      return MINDFUL_SESSIONS.map(toRelaxTrack);
  }
}
