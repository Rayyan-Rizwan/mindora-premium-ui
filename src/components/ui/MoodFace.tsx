import type { CSSProperties } from "react";
import type { MoodTone } from "@/lib/mood";
import { classNames } from "@/lib/utils";

const TONE_INDEX: Record<MoodTone, 1 | 2 | 3 | 4 | 5> = {
  "very-low": 1,
  low: 2,
  okay: 3,
  good: 4,
  great: 5,
};

export function MoodFace({
  tone,
  size = 56,
  animated = false,
  className,
  colors,
}: {
  tone: MoodTone;
  size?: number;
  animated?: boolean;
  className?: string;
  colors?: Partial<Record<MoodTone, string>>;
}) {
  const index = TONE_INDEX[tone];
  const face = colors?.[tone] ?? `var(--mood-${index})`;

  return (
    <svg
      className={classNames(
        "mood-face",
        animated && "mood-face--idle",
        className,
      )}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      style={
        {
          "--face": face,
          "--face-soft": `var(--mood-${index}-soft)`,
        } as CSSProperties
      }
    >
      <circle className="mood-face__head" cx="32" cy="33.5" r="23" />
      <ellipse className="mood-face__gloss" cx="23" cy="21.5" rx="7" ry="4" />

      {tone === "very-low" || tone === "low" ? (
        <path
          className="mood-face__brow"
          d={
            tone === "very-low"
              ? "M19.5 24.5l6 2M44.5 24.5l-6 2"
              : "M20 25.5l5.5 1M44 25.5l-5.5 1"
          }
        />
      ) : null}

      {tone === "very-low" ? (
        <path
          className="mood-face__eye"
          d="M20.5 31q3.5 2.8 7 0M36.5 31q3.5 2.8 7 0"
        />
      ) : tone === "low" ? (
        <path
          className="mood-face__eye"
          d="M21 31.5q3.2 1.4 6.4 0M36.6 31.5q3.2 1.4 6.4 0"
        />
      ) : tone === "great" ? (
        <path
          className="mood-face__eye"
          d="M20.5 31.6q3.5-4.2 7 0M36.5 31.6q3.5-4.2 7 0"
        />
      ) : (
        <>
          <circle
            className="mood-face__pupil"
            cx="24"
            cy="31"
            r={tone === "good" ? 2.1 : 1.9}
          />
          <circle
            className="mood-face__pupil"
            cx="40"
            cy="31"
            r={tone === "good" ? 2.1 : 1.9}
          />
        </>
      )}

      {tone === "very-low" ? (
        <path className="mood-face__mouth" d="M26.5 44.5q5.5-3.2 11 0" />
      ) : tone === "low" ? (
        <path className="mood-face__mouth" d="M27 44.2q5-1.8 10 0" />
      ) : tone === "okay" ? (
        <path className="mood-face__mouth" d="M27.5 42.5q4.5 1.8 9 0" />
      ) : tone === "good" ? (
        <path className="mood-face__mouth" d="M26.5 41.5q5.5 4 11 0" />
      ) : (
        <>
          <path
            className="mood-face__mouth mood-face__mouth--open"
            d="M25.5 40.5q6.5 7.5 13 0Z"
          />
          <path
            className="mood-face__spark"
            d="M49 14.5l1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1 1.1-2.9Z"
          />
        </>
      )}

      {tone === "okay" || tone === "good" || tone === "great" ? (
        <>
          <ellipse
            className="mood-face__blush"
            cx="20.5"
            cy="39"
            rx="3"
            ry="1.9"
          />
          <ellipse
            className="mood-face__blush"
            cx="43.5"
            cy="39"
            rx="3"
            ry="1.9"
          />
        </>
      ) : null}
    </svg>
  );
}
