import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  THEME_EVENT,
  applyTheme,
  getCurrentTheme,
  type ThemeMode,
  type ThemeName,
  type ThemeState,
} from "@/lib/theme";

export function useTheme() {
  const [state, setState] = useState<ThemeState>(() => getCurrentTheme());

  useEffect(() => {
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<ThemeState>).detail;
      if (next?.theme && next?.mode) setState(next);
      else setState(getCurrentTheme());
    };
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  const update = useCallback((next: ThemeState) => {
    applyTheme(next);
    setState(next);
  }, []);

  const setTheme = useCallback(
    (theme: ThemeName) => update({ ...getCurrentTheme(), theme }),
    [update],
  );

  const setMode = useCallback(
    (mode: ThemeMode) => update({ ...getCurrentTheme(), mode }),
    [update],
  );

  const toggleMode = useCallback(() => {
    const current = getCurrentTheme();
    update({ ...current, mode: current.mode === "dark" ? "light" : "dark" });
  }, [update]);

  const resetTheme = useCallback(
    () => update({ ...getCurrentTheme(), theme: DEFAULT_THEME.theme }),
    [update],
  );

  return {
    theme: state.theme,
    mode: state.mode,
    isDark: state.mode === "dark",
    setTheme,
    setMode,
    toggleMode,
    resetTheme,
  };
}
