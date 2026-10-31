export type ThemeName = "lavender" | "peach" | "mint" | "sky" | "rose";
export type ThemeMode = "light" | "dark";

export interface ThemeState {
  theme: ThemeName;
  mode: ThemeMode;
}

export interface ThemeOption {
  id: ThemeName;
  label: string;
  description: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: "lavender",
    label: "Lavender Dream",
    description: "Calm & Focused",
  },
  {
    id: "peach",
    label: "Peach Blossom",
    description: "Warm & Happy",
  },
  {
    id: "mint",
    label: "Mint Calm",
    description: "Fresh & Balanced",
  },
  {
    id: "sky",
    label: "Sky Serenity",
    description: "Peaceful & Clear",
  },
  {
    id: "rose",
    label: "Rose Cloud",
    description: "Soft & Cozy",
  },
];

export const DEFAULT_THEME: ThemeState = { theme: "lavender", mode: "light" };

const THEME_KEY = "mindora_theme";
const MODE_KEY = "mindora_mode";
export const THEME_EVENT = "mindora:theme-change";

const THEME_IDS = new Set<string>(THEMES.map((option) => option.id));

function isThemeName(value: unknown): value is ThemeName {
  return typeof value === "string" && THEME_IDS.has(value);
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Blocked or full storage must never break the theme switch.
  }
}

export function getStoredTheme(): ThemeState | null {
  const storedTheme = readStorage(THEME_KEY);
  const storedMode = readStorage(MODE_KEY);

  // Older builds stored only "light" or "dark" under the theme key.
  if (isThemeMode(storedTheme)) {
    return { theme: "lavender", mode: storedTheme };
  }

  if (!isThemeName(storedTheme)) return null;

  return {
    theme: storedTheme,
    mode: isThemeMode(storedMode) ? storedMode : "light",
  };
}

export function getCurrentTheme(): ThemeState {
  const element = document.documentElement;
  const theme = element.dataset.theme;
  const mode = element.dataset.mode;

  if (isThemeName(theme) && isThemeMode(mode)) {
    return { theme, mode };
  }

  return getStoredTheme() ?? DEFAULT_THEME;
}

function updateMetaColorScheme(): void {
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (!meta) return;
  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg")
    .trim();
  if (bg) meta.content = bg;
}

export function applyTheme(next: ThemeState, persist = true): void {
  const element = document.documentElement;
  element.dataset.theme = next.theme;
  element.dataset.mode = next.mode;
  element.style.colorScheme = next.mode;

  if (persist) {
    writeStorage(THEME_KEY, next.theme);
    writeStorage(MODE_KEY, next.mode);
  }

  updateMetaColorScheme();
  window.dispatchEvent(
    new CustomEvent<ThemeState>(THEME_EVENT, { detail: next }),
  );
}

export function initialiseTheme(): void {
  applyTheme(getStoredTheme() ?? DEFAULT_THEME, false);
}
