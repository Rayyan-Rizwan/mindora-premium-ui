import { useTheme } from "@/hooks/useTheme";
import { MoonIcon, SunIcon } from "./icons";

export function ThemeToggle() {
  const { isDark, toggleMode } = useTheme();
  const next = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={toggleMode}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}
