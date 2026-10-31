import { useId } from "react";
import { CompanionFigure } from "@/components/avatar/CompanionFigure";
import { useCompanion } from "@/hooks/useCompanion";
import type { CompanionCharacter } from "@/lib/companion";
import type { RelaxTrack } from "./tracks";

type BreathPhaseKind = "in" | "hold" | "out";

/**
 * Original, theme-aware SVG scenes for Relax & Listen. Every colour comes from
 * the illustration tokens, so switching palette or dark mode recolours the art.
 */

function SceneCharacter({ character }: { character: CompanionCharacter }) {
  const scale = 0.75;

  return (
    <g className="bs-character">
      <ellipse cx="0" cy="79" rx="112" ry="17" className="bs-cushion-shadow" />
      <ellipse cx="0" cy="70" rx="101" ry="21" className="bs-cushion" />
      <ellipse cx="0" cy="62" rx="82" ry="12" className="bs-cushion-top" />

      <g className="bs-breath">
        <g transform={`translate(${-120 * scale} ${60 - 246 * scale}) scale(${scale})`}>
          <CompanionFigure character={character} state="idle" variant="full" />
        </g>
      </g>
    </g>
  );
}

function Cloud({
  className,
  transform,
}: {
  className?: string;
  transform: string;
}) {
  return (
    <g className={`bs-cloud ${className ?? ""}`} transform={transform}>
      <ellipse cx="0" cy="0" rx="52" ry="20" className="bs-cloud-body" />
      <ellipse cx="-24" cy="-10" rx="26" ry="18" className="bs-cloud-body" />
      <ellipse cx="16" cy="-14" rx="30" ry="22" className="bs-cloud-body" />
      <ellipse cx="40" cy="2" rx="22" ry="14" className="bs-cloud-body" />
    </g>
  );
}

function Leaf({
  transform,
  flip = false,
}: {
  transform: string;
  flip?: boolean;
}) {
  return (
    <g transform={transform}>
      <path
        d={
          flip
            ? "M0 0 C26 -30 58 -42 92 -44 C82 -14 52 8 0 0 Z"
            : "M0 0 C-26 -30 -58 -42 -92 -44 C-82 -14 -52 8 0 0 Z"
        }
        className="bs-leaf-big"
      />
      <path
        d={
          flip
            ? "M6 -4 C34 -20 58 -32 86 -38"
            : "M-6 -4 C-34 -20 -58 -32 -86 -38"
        }
        className="bs-leaf-vein"
        fill="none"
      />
    </g>
  );
}

function Flower({ x, y }: { x: number; y: number }) {
  return (
    <g className="bs-flower" transform={`translate(${x} ${y})`}>
      <path d="M0 0 C-3 16 -2 26 0 34" className="bs-stem" fill="none" />
      <ellipse cx="-8" cy="22" rx="7" ry="4" className="bs-leaf" transform="rotate(-28 -8 22)" />
      <circle cx="0" cy="-2" r="6" className="bs-petal" />
      <circle cx="8" cy="3" r="6" className="bs-petal" />
      <circle cx="5" cy="11" r="6" className="bs-petal" />
      <circle cx="-5" cy="11" r="6" className="bs-petal" />
      <circle cx="-8" cy="3" r="6" className="bs-petal" />
      <circle cx="0" cy="5" r="3.4" className="bs-petal-core" />
    </g>
  );
}

function Spark({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <path
      d="M0 -9 C1.4 -3.2 3.2 -1.4 9 0 C3.2 1.4 1.4 3.2 0 9 C-1.4 3.2 -3.2 1.4 -9 0 C-3.2 -1.4 -1.4 -3.2 0 -9 Z"
      className="bs-spark"
      transform={`translate(${x} ${y}) scale(${scale})`}
    />
  );
}

export function BreathingScene({
  phase,
  started,
  running,
  completed,
  character,
}: {
  phase: BreathPhaseKind;
  started: boolean;
  running: boolean;
  completed: boolean;
  character: CompanionCharacter;
}) {
  const uid = useId().replace(/[:]/g, "");
  const sky = `${uid}-sky`;
  const glow = `${uid}-glow`;
  const arch = `${uid}-arch`;

  return (
    <div
      className="breathing-scene"
      data-phase={phase}
      data-started={started}
      data-running={running}
      data-completed={completed}
    >
      <svg
        viewBox="0 0 640 600"
        className="breathing-scene__art"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="bs-stop-sky-1" />
            <stop offset="58%" className="bs-stop-sky-2" />
            <stop offset="100%" className="bs-stop-sky-3" />
          </linearGradient>
          <radialGradient id={glow} cx="50%" cy="48%" r="55%">
            <stop offset="0%" className="bs-stop-glow-1" />
            <stop offset="66%" className="bs-stop-glow-2" />
            <stop offset="100%" className="bs-stop-glow-3" />
          </radialGradient>
          <linearGradient id={arch} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="bs-stop-arch-1" />
            <stop offset="100%" className="bs-stop-arch-2" />
          </linearGradient>
        </defs>

        <rect width="640" height="600" fill={`url(#${sky})`} />
        <circle
          cx="320"
          cy="330"
          r="262"
          fill={`url(#${glow})`}
          className="bs-aura"
        />
        <path
          d="M146 600 L146 336 C146 222 224 138 320 138 C416 138 494 222 494 336 L494 600 Z"
          fill={`url(#${arch})`}
          className="bs-arch"
        />
        <circle cx="484" cy="122" r="34" className="bs-sun" />
        <circle cx="484" cy="122" r="64" className="bs-sun-glow" />
        <Spark x={430} y={176} scale={1.05} />
        <Spark x={566} y={76} scale={0.7} />
        <Spark x={138} y={150} scale={0.65} />

        <Cloud className="bs-cloud--one" transform="translate(124 146)" />
        <Cloud className="bs-cloud--two" transform="translate(512 238) scale(0.7)" />
        <Cloud className="bs-cloud--three" transform="translate(222 84) scale(0.54)" />

        <path
          d="M0 432 C92 412 188 422 276 426 C376 432 480 412 640 428 L640 600 L0 600 Z"
          className="bs-ground"
        />

        <Cloud className="bs-cloud--bush" transform="translate(118 400) scale(0.78)" />
        <Cloud className="bs-cloud--bush" transform="translate(524 408) scale(0.74)" />
        <Cloud className="bs-cloud--bush" transform="translate(206 428) scale(0.56)" />

        <Leaf transform="translate(0 600) scale(1.1)" />
        <Leaf transform="translate(640 600) scale(1.1)" flip />
        <Leaf transform="translate(84 438) scale(0.55) rotate(18)" />
        <Leaf transform="translate(556 432) scale(0.5) rotate(-18)" flip />

        <g className="bs-garden-left">
          <Flower x={96} y={446} />
          <Flower x={122} y={460} />
          <Flower x={148} y={446} />
        </g>
        <g className="bs-garden-right">
          <Flower x={494} y={454} />
          <Flower x={520} y={440} />
          <Flower x={546} y={456} />
        </g>

        <g transform="translate(320 300) scale(1.28)">
          <SceneCharacter character={character} />
        </g>

        <g className="bs-sparkle-row">
          <Spark x={218} y={300} scale={0.6} />
          <Spark x={420} y={330} scale={0.54} />
          <Spark x={330} y={240} scale={0.5} />
          <Spark x={188} y={400} scale={0.42} />
          <Spark x={452} y={436} scale={0.44} />
        </g>
      </svg>
    </div>
  );
}

export type TrackScene = "water" | "meadow" | "night" | "garden" | "window";

const SCENE_BY_TRACK: Record<string, TrackScene> = {
  "linen-light": "window",
  "quiet-harbour": "water",
  "evening-tide": "water",
  "soft-landing": "meadow",
  "still-point": "water",
  "pale-meadow": "meadow",
  "night-drift": "night",
  "long-exhale": "meadow",
  "moon-garden": "garden",
};

function TrackFlower({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0 C-2 12 -1 20 0 26" className="ta-stem" fill="none" />
      <circle cx="0" cy="-2" r="4.4" className="ta-petal" />
      <circle cx="6" cy="2" r="4.4" className="ta-petal" />
      <circle cx="4" cy="9" r="4.4" className="ta-petal" />
      <circle cx="-4" cy="9" r="4.4" className="ta-petal" />
      <circle cx="-6" cy="2" r="4.4" className="ta-petal" />
      <circle cx="0" cy="4" r="2.4" className="ta-petal-core" />
    </g>
  );
}

function TrackCompanion({ character }: { character: CompanionCharacter }) {
  const scale = 0.3;

  return (
    <g
      className="ta-person"
      transform={`translate(${196 - 120 * scale} ${150 - 198 * scale}) scale(${scale})`}
    >
      <CompanionFigure character={character} state="idle" variant="face" />
    </g>
  );
}

export function TrackArtwork({
  track,
  variant,
  className,
}: {
  track: RelaxTrack;
  variant?: TrackScene;
  className?: string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const { character } = useCompanion();
  const scene = variant ?? SCENE_BY_TRACK[track.id] ?? "meadow";
  const sky = `${uid}-sky`;
  const moon = scene === "night" || scene === "garden";

  return (
    <svg
      viewBox="0 0 320 160"
      className={`track-art ${className ?? ""}`}
      data-scene={scene}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="ta-stop-sky-1" />
          <stop offset="100%" className="ta-stop-sky-2" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill={`url(#${sky})`} />

      {scene === "window" ? (
        <g>
          <rect width="320" height="160" className="ta-wall" />
          <rect x="52" y="22" width="150" height="104" rx="14" className="ta-window" />
          <rect x="62" y="32" width="130" height="84" rx="9" className="ta-window-sky" />
          <circle cx="164" cy="56" r="15" className="ta-sun" />
          <path d="M62 100 Q96 82 128 92 Q160 80 192 96 L192 116 L62 116 Z" className="ta-window-hill" />
          <path d="M132 32 L132 116" className="ta-window-frame" />
          <path d="M62 74 L192 74" className="ta-window-frame" />
          <rect x="56" y="122" width="142" height="6" rx="3" className="ta-window-sill" />
          <g className="ta-pot" transform="translate(232 96)">
            <path d="M-16 0 L16 0 L11 30 L-11 30 Z" className="ta-pot-body" />
            <path d="M0 0 C-2 -16 -12 -22 -22 -24" className="ta-pot-stem" fill="none" />
            <path d="M0 0 C2 -18 12 -26 24 -28" className="ta-pot-stem" fill="none" />
            <ellipse cx="-23" cy="-25" rx="10" ry="5" className="ta-pot-leaf" transform="rotate(-20 -23 -25)" />
            <ellipse cx="25" cy="-29" rx="10" ry="5" className="ta-pot-leaf" transform="rotate(16 25 -29)" />
            <ellipse cx="0" cy="-31" rx="9" ry="5" className="ta-pot-leaf" />
          </g>
          <g className="ta-cat" transform="translate(226 120)">
            <path
              d="M-16 0 C-16 -10 -8 -15 0 -15 C8 -15 16 -10 16 0 Z"
              className="ta-cat-body"
            />
            <circle cx="0" cy="-18" r="9" className="ta-cat-body" />
            <path d="M-8 -24 L-11 -32 L-3 -26 Z" className="ta-cat-body" />
            <path d="M8 -24 L11 -32 L3 -26 Z" className="ta-cat-body" />
            <path d="M12 -10 C20 -10 20 -2 14 0" className="ta-cat-tail" fill="none" />
          </g>
        </g>
      ) : (
        <g>
          {moon ? (
            <g>
              <circle cx="252" cy="46" r="30" className="ta-moon-glow" />
              <circle cx="252" cy="46" r="17" className="ta-moon" />
              <circle cx="259" cy="40" r="3.4" className="ta-moon-crater" />
              <circle cx="245" cy="52" r="2.4" className="ta-moon-crater" />
              {scene === "night" ? (
                <g className="ta-stars">
                  <circle cx="48" cy="34" r="2" />
                  <circle cx="92" cy="58" r="1.6" />
                  <circle cx="140" cy="30" r="2.2" />
                  <circle cx="188" cy="66" r="1.5" />
                  <circle cx="286" cy="86" r="1.8" />
                  <circle cx="68" cy="86" r="1.4" />
                </g>
              ) : null}
            </g>
          ) : (
            <g>
              <circle cx="252" cy="48" r="34" className="ta-sun-glow" />
              <circle cx="252" cy="48" r="17" className="ta-sun" />
            </g>
          )}

          <g className="ta-cloud ta-cloud--one" transform="translate(70 44)">
            <ellipse cx="0" cy="0" rx="34" ry="12" />
            <ellipse cx="-16" cy="-6" rx="17" ry="11" />
            <ellipse cx="12" cy="-8" rx="20" ry="14" />
          </g>
          <g className="ta-cloud ta-cloud--two" transform="translate(160 30) scale(0.7)">
            <ellipse cx="0" cy="0" rx="34" ry="12" />
            <ellipse cx="-16" cy="-6" rx="17" ry="11" />
            <ellipse cx="12" cy="-8" rx="20" ry="14" />
          </g>

          <path
            d="M0 118 C54 96 96 106 142 112 C196 120 244 92 286 104 C304 109 314 114 320 112 L320 160 L0 160 Z"
            className="ta-hill-back"
          />
          <path
            d="M0 136 C64 122 118 130 172 134 C232 139 278 124 320 132 L320 160 L0 160 Z"
            className="ta-hill-front"
          />

          {scene === "water" ? (
            <g className="ta-water">
              <path d="M0 138 Q40 132 80 138 T160 138 T240 138 T320 138 L320 160 L0 160 Z" className="ta-water-sheet" />
              <path d="M28 146 q16 -4 32 0" className="ta-ripple" fill="none" />
              <path d="M104 150 q18 -4 36 0" className="ta-ripple" fill="none" />
              <path d="M212 146 q16 -4 32 0" className="ta-ripple" fill="none" />
              <path d="M226 128 h30 l-4 5 h-22 Z" className="ta-boat" />
              <path d="M226 133 h30 l-5 7 h-20 Z" className="ta-boat-hull" />
              <path d="M241 128 V112" className="ta-mast" fill="none" />
              <path d="M242 112 L254 124 L242 124 Z" className="ta-sail" />
              <g className="ta-pines">
                <path d="M34 140 L46 118 L58 140 Z" className="ta-pine" />
                <path d="M36 130 L46 112 L56 130 Z" className="ta-pine" />
                <path d="M46 140 V112" className="ta-trunk" fill="none" />
                <path d="M286 142 L298 120 L310 142 Z" className="ta-pine" />
                <path d="M288 132 L298 114 L308 132 Z" className="ta-pine" />
                <path d="M298 142 V114" className="ta-trunk" fill="none" />
              </g>
            </g>
          ) : null}

          {scene === "meadow" || scene === "garden" ? (
            <g className="ta-flowers">
              <TrackCompanion character={character} />
              <TrackFlower x={52} y={128} />
              <TrackFlower x={84} y={134} scale={0.8} />
              <TrackFlower x={258} y={132} scale={0.9} />
              <TrackFlower x={286} y={140} scale={0.7} />
              {scene === "garden" ? (
                <TrackFlower x={30} y={140} scale={0.7} />
              ) : null}
            </g>
          ) : null}

          {scene === "night" ? (
            <g className="ta-fireflies">
              <circle cx="120" cy="112" r="2.4" />
              <circle cx="168" cy="98" r="2" />
              <circle cx="206" cy="120" r="2.6" />
            </g>
          ) : null}
        </g>
      )}
    </svg>
  );
}
