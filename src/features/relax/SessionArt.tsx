import { useId } from "react";
import { classNames } from "@/lib/utils";
import type { RelaxTrack } from "./tracks";
import { CURATED_IDS } from "./sessions";
import { TrackArtwork } from "./RelaxArt";

export type BreathPhaseKind = "in" | "hold" | "out";

type SceneId = "ocean" | "forest" | "morning" | "evening" | "breath" | "box";

const SCENE_BY_ID: Record<string, SceneId> = {
  "ocean-waves": "ocean",
  "forest-ambience": "forest",
  "morning-calm": "morning",
  "evening-wind-down": "evening",
  "deep-breathing": "breath",
  "box-breathing": "box",
};

function Cloud({
  x,
  y,
  scale = 1,
  opacity = 1,
}: {
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
}) {
  return (
    <g
      className="sa-cloud"
      transform={`translate(${x} ${y}) scale(${scale})`}
      opacity={opacity}
    >
      <ellipse cx="0" cy="0" rx="42" ry="16" />
      <ellipse cx="-24" cy="-10" rx="22" ry="15" />
      <ellipse cx="10" cy="-13" rx="26" ry="18" />
      <ellipse cx="36" cy="1" rx="18" ry="12" />
    </g>
  );
}

function Spark({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <path
      className="sa-spark"
      d="M0 -8 C1.2 -2.8 2.8 -1.2 8 0 C2.8 1.2 1.2 2.8 0 8 C-1.2 2.8 -2.8 1.2 -8 0 C-2.8 -1.2 -1.2 -2.8 0 -8 Z"
      transform={`translate(${x} ${y}) scale(${scale})`}
    />
  );
}

function Flower({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path className="sa-stem" d="M0 0 C-2 14 -1 24 0 32" fill="none" />
      <ellipse className="sa-leaf" cx="-7" cy="20" rx="7" ry="3.6" transform="rotate(-28 -7 20)" />
      <circle className="sa-petal" cx="0" cy="-2" r="5.4" />
      <circle className="sa-petal" cx="7" cy="3" r="5.4" />
      <circle className="sa-petal" cx="4" cy="10" r="5.4" />
      <circle className="sa-petal" cx="-4" cy="10" r="5.4" />
      <circle className="sa-petal" cx="-7" cy="3" r="5.4" />
      <circle className="sa-petal-core" cx="0" cy="4" r="2.8" />
    </g>
  );
}

function Pine({ x, scale = 1 }: { x: number; scale?: number }) {
  return (
    <g transform={`translate(${x} 240) scale(${scale})`}>
      <rect className="sa-trunk" x="-3" y="0" width="6" height="46" rx="3" />
      <path className="sa-canopy" d="M0 -66 L30 -6 L-30 -6 Z" />
      <path className="sa-canopy-2" d="M0 -46 L36 16 L-36 16 Z" />
      <path className="sa-canopy" d="M0 -24 L42 38 L-42 38 Z" />
    </g>
  );
}

function Lotus({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse className="sa-lotus-petal" cx="0" cy="-18" rx="13" ry="24" />
      <ellipse className="sa-lotus-petal" cx="-20" cy="-10" rx="12" ry="22" transform="rotate(-34 -20 -10)" />
      <ellipse className="sa-lotus-petal" cx="20" cy="-10" rx="12" ry="22" transform="rotate(34 20 -10)" />
      <ellipse className="sa-lotus-petal sa-lotus-petal--soft" cx="-34" cy="6" rx="11" ry="19" transform="rotate(-58 -34 6)" />
      <ellipse className="sa-lotus-petal sa-lotus-petal--soft" cx="34" cy="6" rx="11" ry="19" transform="rotate(58 34 6)" />
      <ellipse className="sa-lotus-base" cx="0" cy="8" rx="42" ry="12" />
    </g>
  );
}

export function SessionArt({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const scene = SCENE_BY_ID[id] ?? "breath";
  const sky = `${uid}-sky`;
  const water = `${uid}-water`;
  const glow = `${uid}-glow`;

  return (
    <svg
      viewBox="0 0 640 360"
      className={classNames("session-art", className)}
      data-scene={scene}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="sa-sky-1" />
          <stop offset="100%" className="sa-sky-2" />
        </linearGradient>
        <linearGradient id={water} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="sa-water-1" />
          <stop offset="100%" className="sa-water-2" />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" className="sa-glow-1" />
          <stop offset="100%" className="sa-glow-2" />
        </radialGradient>
      </defs>

      <rect width="640" height="360" fill={`url(#${sky})`} />

      {scene === "ocean" ? (
        <g>
          <circle cx="500" cy="84" r="86" fill={`url(#${glow})`} className="sa-glow" />
          <circle cx="500" cy="84" r="30" className="sa-sun" />
          <Cloud x={120} y={74} scale={1.1} />
          <Cloud x={330} y={46} scale={0.7} opacity={0.9} />
          <Cloud x={560} y={140} scale={0.62} opacity={0.8} />
          <path className="sa-mountain-back" d="M0 210 C80 150 150 172 220 198 C286 222 344 168 410 188 C478 208 540 164 640 196 L640 224 L0 224 Z" />
          <path className="sa-mountain-front" d="M0 226 C90 194 152 208 218 224 C292 242 350 206 424 218 C500 230 560 206 640 220 L640 240 L0 240 Z" />
          <rect y="220" width="640" height="140" fill={`url(#${water})`} className="sa-water-sheet" />
          <path className="sa-ripple" d="M40 260 q34 -8 68 0" fill="none" />
          <path className="sa-ripple" d="M180 288 q42 -8 84 0" fill="none" />
          <path className="sa-ripple" d="M400 254 q36 -8 72 0" fill="none" />
          <path className="sa-ripple" d="M480 306 q46 -8 92 0" fill="none" />
          <path className="sa-reflect" d="M470 230 L530 230 L508 330 L492 330 Z" />
          <g className="sa-coast">
            <path className="sa-leaf" d="M0 360 C34 300 36 260 30 226 C62 270 64 318 46 360 Z" />
            <path className="sa-leaf sa-leaf--soft" d="M36 360 C78 314 92 278 92 246 C116 292 102 330 78 360 Z" />
            <path className="sa-leaf" d="M640 360 C606 300 604 260 610 226 C578 270 576 318 594 360 Z" />
            <Flower x={70} y={316} scale={0.9} />
            <Flower x={560} y={322} scale={0.8} />
          </g>
          <Spark x={220} y={124} scale={0.8} />
          <Spark x={600} y={70} scale={0.6} />
        </g>
      ) : null}

      {scene === "forest" ? (
        <g>
          <circle cx="150" cy="70" r="70" fill={`url(#${glow})`} className="sa-glow" />
          <circle cx="150" cy="70" r="22" className="sa-sun sa-sun--soft" />
          <path className="sa-mountain-back" d="M0 214 C90 160 170 186 240 208 C320 234 390 174 470 194 C540 212 590 186 640 200 L640 236 L0 236 Z" />
          <path className="sa-mountain-front" d="M0 244 C100 216 190 232 270 246 C350 260 430 226 510 238 C570 246 610 236 640 242 L640 280 L0 280 Z" />
          <g className="sa-trees">
            <Pine x={90} scale={1.25} />
            <Pine x={180} scale={0.9} />
            <Pine x={300} scale={1.1} />
            <Pine x={430} scale={0.8} />
            <Pine x={520} scale={1.3} />
            <Pine x={600} scale={0.95} />
          </g>
          <rect y="284" width="640" height="76" className="sa-forest-floor" />
          <path className="sa-light-ray" d="M164 0 L244 0 L120 360 L40 360 Z" />
          <path className="sa-light-ray sa-light-ray--soft" d="M330 0 L386 0 L300 360 L244 360 Z" />
          <g className="sa-fern">
            <path className="sa-leaf" d="M80 360 C104 310 112 280 108 254 C132 292 126 328 104 360 Z" />
            <path className="sa-leaf sa-leaf--soft" d="M116 360 C150 318 162 288 160 264 C180 304 166 336 140 360 Z" />
            <path className="sa-leaf" d="M560 360 C536 310 528 280 532 254 C508 292 514 328 536 360 Z" />
          </g>
          <g className="sa-fireflies">
            <circle cx="210" cy="230" r="3" />
            <circle cx="360" cy="196" r="2.4" />
            <circle cx="470" cy="250" r="3.2" />
            <circle cx="300" cy="300" r="2.2" />
          </g>
          <Flower x={560} y={332} scale={0.8} />
        </g>
      ) : null}

      {scene === "morning" ? (
        <g>
          <circle cx="500" cy="86" r="96" fill={`url(#${glow})`} className="sa-glow" />
          <circle cx="500" cy="86" r="34" className="sa-sun" />
          <Cloud x={140} y={78} scale={1} />
          <Cloud x={340} y={52} scale={0.62} opacity={0.85} />
          <path className="sa-mountain-back" d="M0 220 C86 174 158 190 230 212 C304 236 372 184 450 202 C530 220 584 190 640 206 L640 244 L0 244 Z" />
          <path className="sa-mountain-front" d="M0 252 C96 224 184 238 264 250 C348 262 428 230 512 242 C570 250 612 242 640 246 L640 300 L0 300 Z" />
          <path className="sa-meadow" d="M0 292 C120 274 236 286 352 292 C472 298 560 282 640 292 L640 360 L0 360 Z" />
          <g className="sa-flowers">
            <Flower x={96} y={318} scale={1} />
            <Flower x={144} y={332} scale={0.7} />
            <Flower x={420} y={326} scale={0.9} />
            <Flower x={474} y={338} scale={0.7} />
            <Flower x={548} y={320} scale={0.8} />
          </g>
          <path className="sa-drift" d="M0 210 C180 190 400 230 640 204" fill="none" />
          <Spark x={220} y={118} scale={0.7} />
        </g>
      ) : null}

      {scene === "evening" ? (
        <g>
          <circle cx="504" cy="78" r="74" fill={`url(#${glow})`} className="sa-glow" />
          <circle cx="504" cy="78" r="26" className="sa-moon" />
          <circle cx="514" cy="70" r="5" className="sa-moon-crater" />
          <Cloud x={130} y={86} scale={0.9} opacity={0.8} />
          <Cloud x={360} y={52} scale={0.6} opacity={0.7} />
          <g className="sa-stars">
            <circle cx="70" cy="60" r="2.6" />
            <circle cx="180" cy="40" r="1.8" />
            <circle cx="250" cy="86" r="2.2" />
            <circle cx="330" cy="34" r="1.6" />
            <circle cx="590" cy="44" r="2.4" />
          </g>
          <path className="sa-mountain-back" d="M0 218 C86 176 160 192 232 212 C306 232 376 184 452 202 C530 220 584 192 640 208 L640 244 L0 244 Z" />
          <path className="sa-mountain-front" d="M0 250 C96 226 184 240 264 252 C348 264 428 234 512 244 C570 250 612 244 640 248 L640 288 L0 288 Z" />
          <rect y="284" width="640" height="76" fill={`url(#${water})`} className="sa-water-sheet sa-water-sheet--dusk" />
          <path className="sa-ripple" d="M70 314 q40 -8 80 0" fill="none" />
          <path className="sa-ripple" d="M440 306 q46 -8 92 0" fill="none" />
          <path className="sa-reflect sa-reflect--moon" d="M486 292 L522 292 L512 352 L496 352 Z" />
          <path className="sa-leaf" d="M0 360 C34 310 36 274 30 244 C62 286 64 326 46 360 Z" />
          <path className="sa-leaf sa-leaf--soft" d="M640 360 C606 310 604 274 610 244 C578 286 576 326 594 360 Z" />
          <Spark x={230} y={150} scale={0.6} />
        </g>
      ) : null}

      {scene === "breath" ? (
        <g>
          <circle cx="320" cy="180" r="150" className="sa-breath-glow" />
          <circle cx="320" cy="180" r="112" className="sa-breath-ring" fill="none" />
          <circle cx="320" cy="180" r="76" className="sa-breath-ring sa-breath-ring--soft" fill="none" />
          <Cloud x={120} y={90} scale={0.9} opacity={0.9} />
          <Cloud x={520} y={80} scale={0.7} opacity={0.8} />
          <Cloud x={90} y={270} scale={0.6} opacity={0.7} />
          <Lotus x={320} y={300} scale={1.5} />
          <Spark x={210} y={140} scale={0.8} />
          <Spark x={440} y={120} scale={0.6} />
          <Spark x={470} y={230} scale={0.7} />
          <Spark x={180} y={236} scale={0.5} />
        </g>
      ) : null}

      {scene === "box" ? (
        <g>
          <circle cx="320" cy="180" r="160" className="sa-breath-glow" />
          <rect x="196" y="56" width="248" height="248" rx="54" className="sa-box-ring" />
          <rect x="232" y="92" width="176" height="176" rx="40" className="sa-box-ring sa-box-ring--soft" />
          <rect x="268" y="128" width="104" height="104" rx="26" className="sa-box-core" />
          <circle cx="196" cy="56" r="7" className="sa-box-dot" />
          <circle cx="444" cy="56" r="7" className="sa-box-dot" />
          <circle cx="196" cy="304" r="7" className="sa-box-dot" />
          <circle cx="444" cy="304" r="7" className="sa-box-dot" />
          <Lotus x={320} y={300} scale={1.1} />
          <Cloud x={110} y={80} scale={0.7} opacity={0.8} />
          <Cloud x={530} y={96} scale={0.6} opacity={0.7} />
          <Spark x={150} y={220} scale={0.7} />
          <Spark x={500} y={200} scale={0.6} />
        </g>
      ) : null}
    </svg>
  );
}

export function TrackVisual({
  track,
  className,
}: {
  track: RelaxTrack;
  className?: string;
}) {
  if (CURATED_IDS.has(track.id)) {
    return <SessionArt id={track.id} className={className} />;
  }
  return <TrackArtwork track={track} className={className} />;
}

export function MeditationScene({
  phase,
  started,
  running,
  completed,
  className,
}: {
  phase: BreathPhaseKind;
  started: boolean;
  running: boolean;
  completed: boolean;
  className?: string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const sky = `${uid}-sky`;
  const glow = `${uid}-glow`;
  const ground = `${uid}-ground`;

  return (
    <div
      className={classNames("meditation-scene", className)}
      data-phase={phase}
      data-started={started}
      data-running={running}
      data-completed={completed}
    >
      <svg
        viewBox="0 0 640 700"
        className="meditation-scene__art"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="ms-stop-sky-1" />
            <stop offset="62%" className="ms-stop-sky-2" />
            <stop offset="100%" className="ms-stop-sky-3" />
          </linearGradient>
          <radialGradient id={glow} cx="50%" cy="46%" r="56%">
            <stop offset="0%" className="ms-stop-glow-1" />
            <stop offset="70%" className="ms-stop-glow-2" />
            <stop offset="100%" className="ms-stop-glow-3" />
          </radialGradient>
          <linearGradient id={ground} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="ms-stop-ground-1" />
            <stop offset="100%" className="ms-stop-ground-2" />
          </linearGradient>
        </defs>

        <rect width="640" height="700" fill={`url(#${sky})`} />
        <circle cx="320" cy="300" r="270" fill={`url(#${glow})`} className="ms-aura" />
        <circle cx="500" cy="112" r="34" className="ms-sun" />
        <circle cx="500" cy="112" r="62" className="ms-sun-glow" />

        <Cloud x={130} y={130} scale={0.9} />
        <Cloud x={520} y={190} scale={0.7} opacity={0.9} />
        <Cloud x={210} y={78} scale={0.55} opacity={0.8} />

        <path
          d="M0 510 C100 486 190 498 282 502 C382 508 486 486 640 500 L640 700 L0 700 Z"
          fill={`url(#${ground})`}
          className="ms-ground"
        />

        <g className="ms-plants-left">
          <path className="ms-leaf" d="M0 700 C34 620 36 560 28 510 C70 570 70 640 46 700 Z" />
          <path className="ms-leaf ms-leaf--soft" d="M40 700 C94 628 106 574 100 530 C134 590 114 656 82 700 Z" />
          <path className="ms-stem" d="M96 610 C92 580 96 548 108 520" fill="none" />
          <Flower x={112} y={524} scale={1.1} />
          <Flower x={74} y={560} scale={0.8} />
        </g>
        <g className="ms-plants-right">
          <path className="ms-leaf" d="M640 700 C606 620 604 560 612 510 C570 570 570 640 594 700 Z" />
          <path className="ms-leaf ms-leaf--soft" d="M600 700 C546 628 534 574 540 530 C506 590 526 656 558 700 Z" />
          <path className="ms-stem" d="M544 610 C548 580 544 548 532 520" fill="none" />
          <Flower x={528} y={524} scale={1.1} />
          <Flower x={566} y={560} scale={0.8} />
        </g>

        <ellipse cx="320" cy="592" rx="158" ry="34" className="ms-cushion-shadow" />
        <ellipse cx="320" cy="578" rx="150" ry="32" className="ms-cushion" />
        <ellipse cx="320" cy="566" rx="116" ry="19" className="ms-cushion-top" />

        <g className="ms-breath">
          <g className="ms-figure">
            <path
              className="ms-pants"
              d="M320 548 C278 552 238 540 212 514 C232 492 280 496 312 520 Z"
            />
            <path
              className="ms-pants"
              d="M320 548 C362 552 402 540 428 514 C408 492 360 496 328 520 Z"
            />
            <ellipse className="ms-foot" cx="240" cy="536" rx="30" ry="14" transform="rotate(-10 240 536)" />
            <ellipse className="ms-foot" cx="400" cy="536" rx="30" ry="14" transform="rotate(10 400 536)" />
            <path className="ms-pants-line" d="M276 532 C296 540 316 542 334 532" fill="none" />
            <path className="ms-pants-line" d="M306 552 C322 548 338 548 352 552" fill="none" />

            <path
              className="ms-top"
              d="M320 366 C280 370 258 404 262 456 C266 500 290 526 320 528 C350 526 374 500 378 456 C382 404 360 370 320 366 Z"
            />
            <path className="ms-top-trim" d="M288 392 C303 410 337 410 352 392" fill="none" />
            <path className="ms-sash" d="M268 458 C292 468 348 468 372 458 L370 478 C346 488 294 488 270 478 Z" />

            <path className="ms-arm" d="M278 402 C250 430 238 468 244 504" fill="none" />
            <path className="ms-arm" d="M362 402 C390 430 402 468 396 504" fill="none" />
            <path className="ms-sleeve" d="M276 390 C262 398 254 414 254 430 C268 424 282 408 288 396 Z" />
            <path className="ms-sleeve" d="M364 390 C378 398 386 414 386 430 C372 424 358 408 352 396 Z" />
            <ellipse className="ms-hand" cx="244" cy="508" rx="15" ry="11" transform="rotate(-14 244 508)" />
            <ellipse className="ms-hand" cx="396" cy="508" rx="15" ry="11" transform="rotate(14 396 508)" />

            <rect className="ms-neck" x="305" y="338" width="30" height="38" rx="14" />
            <circle className="ms-ear" cx="262" cy="306" r="10" />
            <circle className="ms-ear" cx="378" cy="306" r="10" />
            <circle className="ms-face" cx="320" cy="298" r="58" />

            <path
              className="ms-hair"
              d="M320 222 C264 222 236 262 242 324 C246 370 238 422 252 462 C268 448 270 396 278 360 C292 374 306 380 320 380 C334 380 348 374 362 360 C370 396 372 448 388 462 C402 422 394 370 398 324 C404 262 376 222 320 222 Z"
            />
            <path
              className="ms-fringe"
              d="M266 290 C271 250 292 232 320 232 C348 232 369 250 374 290 C358 268 340 260 320 260 C300 260 282 268 266 290 Z"
            />
            <path className="ms-hair-shine" d="M284 262 C294 246 306 239 320 238" fill="none" />
            <path className="ms-hair-shine" d="M356 262 C346 246 334 239 320 238" fill="none" />

            <path className="ms-brow" d="M292 292 C298 288 306 288 312 292" fill="none" />
            <path className="ms-brow" d="M328 292 C334 288 342 288 348 292" fill="none" />
            <path className="ms-eye" d="M294 306 C300 313 309 313 315 306" fill="none" />
            <path className="ms-eye" d="M325 306 C331 313 340 313 346 306" fill="none" />
            <path className="ms-nose" d="M320 312 C318 318 318 322 321 324" fill="none" />
            <path className="ms-smile" d="M309 330 C315 337 325 337 331 330" fill="none" />
            <circle className="ms-blush" cx="286" cy="322" r="8" />
            <circle className="ms-blush" cx="354" cy="322" r="8" />

            <g className="ms-hair-flower" transform="translate(372 264)">
              <circle cx="0" cy="-9" r="6" className="ms-petal" />
              <circle cx="8" cy="-2" r="6" className="ms-petal" />
              <circle cx="5" cy="7" r="6" className="ms-petal" />
              <circle cx="-5" cy="7" r="6" className="ms-petal" />
              <circle cx="-8" cy="-2" r="6" className="ms-petal" />
              <circle cx="0" cy="0" r="3.4" className="ms-petal-core" />
            </g>

            <path className="ms-chest" d="M295 382 C306 396 334 396 345 382 C342 402 298 402 295 382 Z" />
            <path className="ms-necklace" d="M302 378 C312 390 328 390 338 378" fill="none" />
          </g>
        </g>

        <g className="ms-foreground">
          <Flower x={186} y={640} scale={0.9} />
          <Flower x={454} y={648} scale={0.8} />
          <Spark x={150} y={360} scale={0.6} />
          <Spark x={492} y={330} scale={0.55} />
          <Spark x={330} y={190} scale={0.5} />
        </g>
      </svg>
    </div>
  );
}
