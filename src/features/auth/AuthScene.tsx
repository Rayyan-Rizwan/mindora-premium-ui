import type { CompanionCharacter } from "@/lib/companion";
import { classNames } from "@/lib/utils";
import { CompanionFigure } from "@/components/avatar/CompanionFigure";
import type { CompanionState } from "@/components/avatar/states";

export type AuthMascotState = "idle" | "listening" | "cheerful";
export type AuthSceneVariant = "panel" | "banner" | "hills" | "peek";

function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g
      className="auth-scene__cloud"
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <ellipse cx="0" cy="0" rx="58" ry="21" />
      <ellipse cx="-30" cy="-12" rx="30" ry="21" />
      <ellipse cx="12" cy="-17" rx="36" ry="26" />
      <ellipse cx="46" cy="-2" rx="26" ry="16" />
    </g>
  );
}

function Spark({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <path
      className="auth-scene__spark"
      transform={`translate(${x} ${y}) scale(${scale})`}
      d="M0 -10C1.5 -3.6 3.6 -1.5 10 0 3.6 1.5 1.5 3.6 0 10-1.5 3.6-3.6 1.5-10 0-3.6 -1.5 -1.5 -3.6 0 -10Z"
    />
  );
}

function Butterfly({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g
      className="auth-scene__butterfly"
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <ellipse
        className="auth-scene__butterfly-wing"
        cx="-8"
        cy="-4"
        rx="10"
        ry="13"
        transform="rotate(-24 -8 -4)"
      />
      <ellipse
        className="auth-scene__butterfly-wing auth-scene__butterfly-wing--soft"
        cx="8"
        cy="-4"
        rx="10"
        ry="13"
        transform="rotate(24 8 -4)"
      />
      <ellipse
        className="auth-scene__butterfly-wing"
        cx="-6"
        cy="9"
        rx="7"
        ry="9"
        transform="rotate(-14 -6 9)"
      />
      <ellipse
        className="auth-scene__butterfly-wing auth-scene__butterfly-wing--soft"
        cx="6"
        cy="9"
        rx="7"
        ry="9"
        transform="rotate(14 6 9)"
      />
      <path
        d="M0-9C1-3 1 3 0 9"
        stroke="var(--ill-ink-soft)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

function Flower({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g className="auth-scene__flower" transform={`translate(${x} ${y}) scale(${scale})`}>
      <path className="auth-scene__stem" d="M0 0C-2 12-1 22 0 30" fill="none" />
      <ellipse className="auth-scene__leaf" cx="-7" cy="18" rx="7" ry="3.6" transform="rotate(-30 -7 18)" />
      <circle className="auth-scene__petal" cx="0" cy="-6" r="7" />
      <circle className="auth-scene__petal" cx="9" cy="1" r="7" />
      <circle className="auth-scene__petal" cx="5" cy="11" r="7" />
      <circle className="auth-scene__petal" cx="-5" cy="11" r="7" />
      <circle className="auth-scene__petal" cx="-9" cy="1" r="7" />
      <circle className="auth-scene__petal-core" cx="0" cy="4" r="3.6" />
    </g>
  );
}

function Mushroom({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g
      className="auth-scene__mushroom"
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <path
        className="auth-scene__mushroom-stem"
        d="M-5 0C-5-8-4-12-3-17H3C4-12 5-8 5 0Z"
      />
      <path
        className="auth-scene__mushroom-cap"
        d="M-18-16C-18-27-10-34 0-34S18-27 18-16C12-11-12-11-18-16Z"
      />
      <circle className="auth-scene__mushroom-dot" cx="-7" cy="-24" r="2.4" />
      <circle className="auth-scene__mushroom-dot" cx="6" cy="-27" r="1.9" />
      <circle className="auth-scene__mushroom-dot" cx="10" cy="-19" r="1.5" />
    </g>
  );
}

function Leaves({
  x,
  y,
  scale = 1,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
}) {
  return (
    <g
      className="auth-scene__foliage"
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
    >
      <path className="auth-scene__stem auth-scene__stem--thick" d="M0 0C-5-16-3-34 2-48" fill="none" />
      <path className="auth-scene__stem auth-scene__stem--thick" d="M2 0C8-13 18-24 30-33" fill="none" />
      <ellipse
        className="auth-scene__leaf auth-scene__leaf--big"
        cx="-18"
        cy="-38"
        rx="27"
        ry="10"
        transform="rotate(-36 -18 -38)"
      />
      <ellipse
        className="auth-scene__leaf auth-scene__leaf--deep"
        cx="-2"
        cy="-48"
        rx="22"
        ry="9"
        transform="rotate(-10 -2 -48)"
      />
      <ellipse
        className="auth-scene__leaf auth-scene__leaf--big"
        cx="18"
        cy="-40"
        rx="21"
        ry="8"
        transform="rotate(26 18 -40)"
      />
      <ellipse
        className="auth-scene__leaf auth-scene__leaf--deep"
        cx="31"
        cy="-28"
        rx="16"
        ry="7"
        transform="rotate(42 31 -28)"
      />
    </g>
  );
}

function Bush({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g className="auth-scene__bush" transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="-16" cy="0" rx="18" ry="13" />
      <ellipse cx="14" cy="-2" rx="20" ry="15" />
      <ellipse cx="0" cy="-12" rx="16" ry="13" />
    </g>
  );
}

function Mascot({
  character,
  state,
  mood,
  x,
  y,
  scale,
}: {
  character: CompanionCharacter;
  state: AuthMascotState;
  mood: "calm" | "happy";
  x: number;
  y: number;
  scale: number;
}) {
  const figureState: CompanionState =
    state === "cheerful"
      ? "encouraging"
      : state === "listening"
        ? "listening"
        : mood === "happy"
          ? "encouraging"
          : "idle";
  const figureScale = scale * 0.8;
  const left = x - 120 * figureScale;
  const top = y + 60 * scale - 246 * figureScale;

  return (
    <g transform={`translate(${left} ${top}) scale(${figureScale})`}>
      <g className="auth-scene__mascot">
        <CompanionFigure
          character={character}
          state={figureState}
          variant="full"
        />
      </g>
    </g>
  );
}

export function AuthScene({
  character,
  state,
  variant = "panel",
  mood = "calm",
  className,
}: {
  character: CompanionCharacter;
  state: AuthMascotState;
  variant?: AuthSceneVariant;
  mood?: "calm" | "happy";
  className?: string;
}) {
  return (
    <div
      className={classNames("auth-scene", `auth-scene--${variant}`, className)}
      data-state={state}
      data-mood={mood}
      aria-hidden="true"
    >
      <svg
        viewBox={
          variant === "panel"
            ? "0 0 720 900"
            : variant === "banner"
              ? "0 0 1000 320"
              : variant === "hills"
                ? "0 0 720 200"
                : "0 0 300 300"
        }
        className="auth-scene__svg"
        preserveAspectRatio={variant === "peek" ? "xMidYMid meet" : "xMidYMax slice"}
        role="presentation"
      >
        {variant === "panel" ? (
          <>
            <circle cx="588" cy="186" r="124" className="auth-scene__sun-glow" />
            <circle cx="588" cy="186" r="52" className="auth-scene__sun" />
            <Cloud x={150} y={164} scale={1.05} />
            <Cloud x={508} y={104} scale={0.68} />
            <Cloud x={338} y={292} scale={0.52} />
            <Spark x={634} y={330} scale={0.7} />
            <Spark x={98} y={352} scale={0.5} />
            <Butterfly x={468} y={452} scale={0.9} />

            <path
              className="auth-scene__hill auth-scene__hill--back"
              d="M0 522C94 472 190 488 282 504 386 522 462 466 548 478 624 488 682 510 720 502V900H0Z"
            />
            <path
              className="auth-scene__hill auth-scene__hill--sand"
              d="M0 596C114 558 232 578 350 588 470 598 592 560 720 576V900H0Z"
            />
            <path
              className="auth-scene__hill auth-scene__hill--mid"
              d="M0 664C122 628 238 648 352 654 472 660 592 630 720 646V900H0Z"
            />
            <path
              className="auth-scene__hill auth-scene__hill--front"
              d="M0 746C140 712 260 732 380 738 500 744 600 720 720 732V900H0Z"
            />

            <Bush x={128} y={712} scale={1.15} />
            <Bush x={606} y={720} scale={0.95} />
            <Leaves x={132} y={840} scale={1.7} />
            <Leaves x={604} y={836} scale={1.5} flip />

            <Mascot
              character={character}
              state={state}
              mood={mood}
              x={360}
              y={770}
              scale={1.3}
            />

            <Flower x={236} y={836} scale={0.88} />
            <Flower x={506} y={842} scale={0.78} />
            <Mushroom x={284} y={872} scale={0.95} />
            <Mushroom x={468} y={878} scale={0.8} />
            <g className="auth-scene__grass">
              <path d="M324 882c2-12 4-18 8-24M330 882c-4-10-4-16-2-22M418 886c2-12 5-17 9-21M424 886c-4-9-4-14-2-20" />
            </g>
            <Spark x={276} y={586} scale={0.5} />
            <Spark x={430} y={566} scale={0.4} />
          </>
        ) : null}

        {variant === "banner" ? (
          <>
            <circle cx="770" cy="84" r="104" className="auth-scene__sun-glow" />
            <circle cx="770" cy="84" r="36" className="auth-scene__sun" />
            <Cloud x={286} y={84} scale={0.88} />
            <Cloud x={594} y={54} scale={0.54} />
            <Spark x={884} y={132} scale={0.55} />
            <Spark x={150} y={170} scale={0.45} />
            <Butterfly x={700} y={146} scale={0.75} />

            <path
              className="auth-scene__hill auth-scene__hill--back"
              d="M0 142C140 112 280 124 420 132 560 140 700 108 840 118 906 123 960 132 1000 128V320H0Z"
            />
            <path
              className="auth-scene__hill auth-scene__hill--sand"
              d="M0 194C156 168 312 184 468 190 624 196 812 168 1000 182V320H0Z"
            />
            <path
              className="auth-scene__hill auth-scene__hill--mid"
              d="M0 248C172 224 344 240 516 246 688 252 846 230 1000 242V320H0Z"
            />
            <path
              className="auth-scene__hill auth-scene__hill--front"
              d="M0 292C192 272 384 284 576 288 768 292 900 278 1000 286V320H0Z"
            />

            <Bush x={206} y={286} scale={0.72} />
            <Bush x={812} y={292} scale={0.64} />
            <Leaves x={238} y={318} scale={1.4} />
            <Leaves x={784} y={314} scale={1.24} flip />

            <Mascot
              character={character}
              state={state}
              mood={mood}
              x={500}
              y={216}
              scale={1.26}
            />

            <g className="auth-scene__cloud-mound">
              <ellipse cx="388" cy="318" rx="92" ry="28" />
              <ellipse cx="500" cy="324" rx="124" ry="32" />
              <ellipse cx="616" cy="316" rx="86" ry="26" />
            </g>

            <Flower x={372} y={308} scale={0.64} />
            <Flower x={650} y={312} scale={0.58} />
            <Mushroom x={404} y={316} scale={0.62} />
            <Mushroom x={600} y={318} scale={0.54} />
            <g className="auth-scene__grass">
              <path d="M462 318c2-9 4-13 7-17M467 318c-3-7-3-12-1-16M542 318c2-9 4-12 7-15M547 318c-3-7-3-11-1-14" />
            </g>
          </>
        ) : null}

        {variant === "hills" ? (
          <>
            <path
              className="auth-scene__hill auth-scene__hill--back"
              d="M0 64C104 36 208 50 308 58 412 66 492 38 576 46 642 52 686 64 720 58V200H0Z"
            />
            <path
              className="auth-scene__hill auth-scene__hill--sand"
              d="M0 108C112 84 228 98 348 104 468 110 590 86 720 98V200H0Z"
            />
            <path
              className="auth-scene__hill auth-scene__hill--front"
              d="M0 158C138 140 262 150 382 154 500 158 604 146 720 152V200H0Z"
            />

            <Bush x={122} y={152} scale={0.72} />
            <Bush x={612} y={158} scale={0.66} />
            <Leaves x={148} y={196} scale={1.35} />
            <Leaves x={586} y={192} scale={1.2} flip />

            <Flower x={244} y={180} scale={0.62} />
            <Flower x={496} y={184} scale={0.58} />
            <Mushroom x={282} y={192} scale={0.62} />
            <Mushroom x={462} y={194} scale={0.56} />
            <Spark x={356} y={52} scale={0.5} />
            <Spark x={654} y={82} scale={0.4} />
            <g className="auth-scene__grass">
              <path d="M330 198c2-8 4-12 7-15M335 198c-3-6-3-10-1-14M412 198c2-8 4-11 7-14M417 198c-3-6-3-10-1-13" />
            </g>
          </>
        ) : null}

        {variant === "peek" ? (
          <>
            <circle cx="150" cy="168" r="88" className="auth-scene__halo" />
            <Spark x={44} y={86} scale={0.5} />
            <Spark x={258} y={108} scale={0.62} />
            <Spark x={224} y={26} scale={0.4} />
            <Leaves x={80} y={286} scale={0.85} />
            <Leaves x={226} y={282} scale={0.78} flip />

            <Mascot
              character={character}
              state={state}
              mood={mood}
              x={150}
              y={236}
              scale={0.9}
            />

            <g className="auth-scene__cloud-mound">
              <ellipse cx="52" cy="282" rx="56" ry="28" />
              <ellipse cx="150" cy="292" rx="76" ry="32" />
              <ellipse cx="250" cy="280" rx="54" ry="26" />
            </g>
          </>
        ) : null}
      </svg>
    </div>
  );
}
