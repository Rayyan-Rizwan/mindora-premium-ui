export type CompanionCharacterId = "lumi" | "momo" | "pip";
export type CompanionAccessory = "sprout" | "ears" | "star";

export interface CompanionPalette {
  bodyLight: string;
  body: string;
  bodyDeep: string;
  limb: string;
  accent: string;
  glow: string;
  orb1: string;
  orb2: string;
  orb3: string;
  accessory: string;
  accessorySoft: string;
  accessoryAlt: string;
  blush: string;
  shadow: string;
  eye: string;
  eyeDeep: string;
  nose: string;
  mouth: string;
  stem: string;
  leafLeft: string;
  leafRight: string;
}

export interface CompanionCharacter {
  id: CompanionCharacterId;
  name: string;
  trait: string;
  description: string;
  accessory: CompanionAccessory;
  palette: CompanionPalette;
}

export const COMPANION_CHARACTERS: CompanionCharacter[] = [
  {
    id: "lumi",
    name: "Lumi",
    trait: "Gentle",
    description:
      "Lavender softness with a tiny sprout that sways while they listen.",
    accessory: "sprout",
    palette: {
      bodyLight: "#fbf8ff",
      body: "#dfcef5",
      bodyDeep: "#c4afec",
      limb: "#ccb9ef",
      accent: "#a48fd6",
      glow: "#cfbef2",
      orb1: "#b3a2e4",
      orb2: "#a9c1e8",
      orb3: "#f0c9b5",
      accessory: "#6c5190",
      accessorySoft: "#a9d6bc",
      accessoryAlt: "#c9b2ee",
      blush: "#f6b6c8",
      shadow: "#5d4f7d",
      eye: "#3a3155",
      eyeDeep: "#221c33",
      nose: "#c9b3da",
      mouth: "#7c6192",
      stem: "#6c5190",
      leafLeft: "#a9d6bc",
      leafRight: "#c9b2ee",
    },
  },
  {
    id: "momo",
    name: "Momo",
    trait: "Steady",
    description:
      "Warm apricot with round ears and an unhurried, steady presence.",
    accessory: "ears",
    palette: {
      bodyLight: "#fbe6d6",
      body: "#f6cfb6",
      bodyDeep: "#ecb393",
      limb: "#f2c4a8",
      accent: "#d99170",
      glow: "#f7cbb5",
      orb1: "#e9a98a",
      orb2: "#f2c9a0",
      orb3: "#cfe0c8",
      accessory: "#e0a082",
      accessorySoft: "#f9d8c6",
      accessoryAlt: "#f0b79c",
      blush: "#e8998a",
      shadow: "#7a5544",
      eye: "#4a3327",
      eyeDeep: "#2f1f16",
      nose: "#d9a98c",
      mouth: "#7a5038",
      stem: "#b5795e",
      leafLeft: "#f2b39a",
      leafRight: "#f7d0b8",
    },
  },
  {
    id: "pip",
    name: "Pip",
    trait: "Playful",
    description:
      "Bright mint with a little star that twinkles whenever they’re curious.",
    accessory: "star",
    palette: {
      bodyLight: "#e4f4ea",
      body: "#c8e6d4",
      bodyDeep: "#a9d2ba",
      limb: "#b6dcc4",
      accent: "#7fbb9a",
      glow: "#bfe6cf",
      orb1: "#9fd0b3",
      orb2: "#b9d9c4",
      orb3: "#f3d7a8",
      accessory: "#8fae98",
      accessorySoft: "#f2c879",
      accessoryAlt: "#f9e3ad",
      blush: "#f0b9a6",
      shadow: "#476b58",
      eye: "#2f4a3e",
      eyeDeep: "#1c2f26",
      nose: "#b4d0c0",
      mouth: "#4c6b5c",
      stem: "#5f8f74",
      leafLeft: "#8fd0a9",
      leafRight: "#f2c879",
    },
  },
];

export const DEFAULT_CHARACTER_ID: CompanionCharacterId = "lumi";
const COMPANION_KEY = "mindora_companion";
export const COMPANION_EVENT = "mindora:companion-change";

const CHARACTER_IDS = new Set<string>(
  COMPANION_CHARACTERS.map((character) => character.id),
);

export function isCompanionCharacterId(
  value: unknown,
): value is CompanionCharacterId {
  return typeof value === "string" && CHARACTER_IDS.has(value);
}

function readStorage(): string | null {
  try {
    return localStorage.getItem(COMPANION_KEY);
  } catch {
    return null;
  }
}

export function getStoredCompanionId(): CompanionCharacterId | null {
  const stored = readStorage();
  return isCompanionCharacterId(stored) ? stored : null;
}

export function getCompanionCharacter(
  id: CompanionCharacterId | null = getStoredCompanionId(),
): CompanionCharacter {
  const fallback =
    COMPANION_CHARACTERS.find(
      (character) => character.id === DEFAULT_CHARACTER_ID,
    ) ?? COMPANION_CHARACTERS[0];
  if (!id) return fallback;
  return (
    COMPANION_CHARACTERS.find((character) => character.id === id) ?? fallback
  );
}

function announce(id: CompanionCharacterId): void {
  window.dispatchEvent(
    new CustomEvent<CompanionCharacterId>(COMPANION_EVENT, { detail: id }),
  );
}

export function saveCompanionCharacter(id: CompanionCharacterId): void {
  try {
    localStorage.setItem(COMPANION_KEY, id);
  } catch {
    // A blocked or full storage must never break the picker.
  }
  announce(id);
}

export function resetCompanionCharacter(): void {
  try {
    localStorage.removeItem(COMPANION_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
  announce(DEFAULT_CHARACTER_ID);
}
