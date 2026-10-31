import { useId } from "react";
import type { CompanionCharacter } from "@/lib/companion";
import { classNames } from "@/lib/utils";
import type { CompanionState } from "./states";

export interface CompanionFigureProps {
  character: CompanionCharacter;
  state?: CompanionState;
  variant?: "full" | "face";
  className?: string;
}

/**
 * The single canonical drawing of the Mindora companion. Every avatar surface
 * (auth scene, dashboard, chat, voice, assessment, settings, breathing) renders
 * this geometry at a different size so the character never changes identity.
 *
 * Coordinate space: 240 wide, 282 tall, origin at (0, -16).
 */
export function CompanionFigure({
  character,
  state = "idle",
  variant = "full",
  className,
}: CompanionFigureProps) {
  const uid = useId().replace(/[:]/g, "");
  const headGradient = `${uid}-head`;
  const bodyGradient = `${uid}-body`;
  const earGradient = `${uid}-ear`;
  const eyeGradient = `${uid}-eye`;
  const glowGradient = `${uid}-glow`;
  const { palette } = character;

  const happy = state === "responding" || state === "encouraging";
  const thinking = state === "thinking";
  const sad = state === "error";

  return (
    <g
      className={classNames(
        "companion-figure",
        `companion-art--${state}`,
        className,
      )}
      data-character={character.id}
      data-state={state}
    >
      <defs>
        <radialGradient id={headGradient} cx="50%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="34%" stopColor={palette.bodyLight} />
          <stop offset="74%" stopColor={palette.body} />
          <stop offset="100%" stopColor={palette.bodyDeep} />
        </radialGradient>
        <radialGradient id={bodyGradient} cx="50%" cy="12%" r="88%">
          <stop offset="0%" stopColor={palette.bodyLight} />
          <stop offset="26%" stopColor={palette.body} />
          <stop offset="100%" stopColor={palette.bodyDeep} />
        </radialGradient>
        <linearGradient id={earGradient} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={palette.body} />
          <stop offset="100%" stopColor={palette.bodyDeep} />
        </linearGradient>
        <radialGradient id={eyeGradient} cx="46%" cy="38%" r="64%">
          <stop offset="0%" stopColor={palette.eye} />
          <stop offset="100%" stopColor={palette.eyeDeep} />
        </radialGradient>
        <radialGradient id={glowGradient} cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor={palette.glow} stopOpacity="0.5" />
          <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {variant === "full" ? (
        <>
          <circle cx="120" cy="118" r="104" fill={`url(#${glowGradient})`} />
          <ellipse
            className="companion-art__shadow"
            cx="120"
            cy="252"
            rx="58"
            ry="9"
            fill={palette.shadow}
            opacity="0.14"
          />
        </>
      ) : null}

      <g className="companion-art__body">
        {/* Drooping side lobes belong to the silhouette of every character. */}
        <g className="companion-art__lobes">
          <ellipse
            cx="57"
            cy="139"
            rx="27"
            ry="45"
            fill={`url(#${earGradient})`}
            transform="rotate(10 57 139)"
          />
          <ellipse
            cx="183"
            cy="139"
            rx="27"
            ry="45"
            fill={`url(#${earGradient})`}
            transform="rotate(-10 183 139)"
          />
          <ellipse
            cx="52"
            cy="145"
            rx="11"
            ry="27"
            fill={palette.bodyLight}
            opacity="0.4"
          />
          <ellipse
            cx="188"
            cy="145"
            rx="11"
            ry="27"
            fill={palette.bodyLight}
            opacity="0.4"
          />
        </g>

        {character.accessory === "ears" ? (
          <g className="companion-art__accessory companion-art__accessory--ears">
            <ellipse
              cx="85"
              cy="18"
              rx="19"
              ry="33"
              fill={palette.accessory}
              transform="rotate(-13 85 18)"
            />
            <ellipse
              cx="155"
              cy="18"
              rx="19"
              ry="33"
              fill={palette.accessory}
              transform="rotate(13 155 18)"
            />
            <ellipse
              cx="85"
              cy="22"
              rx="9"
              ry="20"
              fill={palette.accessorySoft}
              transform="rotate(-13 85 22)"
            />
            <ellipse
              cx="155"
              cy="22"
              rx="9"
              ry="20"
              fill={palette.accessorySoft}
              transform="rotate(13 155 22)"
            />
          </g>
        ) : null}

        {variant === "full" ? (
          <g className="companion-art__torso">
            <path
              d="M120 150C90 150 70 172 70 200C70 228 90 242 120 242C150 242 170 228 170 200C170 172 150 150 120 150Z"
              fill={`url(#${bodyGradient})`}
            />
            <ellipse cx="120" cy="189" rx="34" ry="25" fill="#ffffff" opacity="0.28" />
            <ellipse cx="120" cy="212" rx="26" ry="23" fill="#ffffff" opacity="0.55" />
            <ellipse
              cx="67"
              cy="196"
              rx="10"
              ry="19"
              fill={palette.limb}
              transform="rotate(16 67 196)"
            />
            <ellipse
              cx="173"
              cy="196"
              rx="10"
              ry="19"
              fill={palette.limb}
              transform="rotate(-16 173 196)"
            />
            <ellipse cx="101" cy="240" rx="15" ry="8" fill={palette.limb} />
            <ellipse cx="139" cy="240" rx="15" ry="8" fill={palette.limb} />
            <ellipse cx="101" cy="243" rx="15" ry="5" fill={palette.bodyDeep} opacity="0.25" />
            <ellipse cx="139" cy="243" rx="15" ry="5" fill={palette.bodyDeep} opacity="0.25" />
          </g>
        ) : null}

        <g className="companion-art__head">
          <path
            d="M120 24C78 24 47 51 43 91C39 129 50 157 76 168C94 176 146 176 164 168C190 157 201 129 197 91C193 51 162 24 120 24Z"
            fill={`url(#${headGradient})`}
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="1.6"
          />
          <path
            className="companion-art__sheen"
            d="M120 31C86 31 60 52 49 83C60 58 84 44 120 44C156 44 180 58 191 83C180 52 154 31 120 31Z"
            fill="#ffffff"
            opacity="0.5"
          />
          <ellipse
            cx="120"
            cy="158"
            rx="56"
            ry="22"
            fill={palette.bodyDeep}
            opacity="0.18"
          />
        </g>

        {character.accessory === "sprout" ? (
          <g className="companion-art__accessory companion-art__accessory--sprout">
            <path
              d="M120 35C120 26 120 19 121 12"
              stroke={palette.stem}
              strokeWidth="4.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M119 19C108 10 96 6 86 10C86 22 98 30 113 28C116 25 118 22 119 19Z"
              fill={palette.leafLeft}
            />
            <path
              d="M116 24C108 22 99 20 91 18"
              stroke="#ffffff"
              strokeOpacity="0.4"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M123 16C134 5 148 0 157 4C157 17 145 27 129 24C127 21 125 18 123 16Z"
              fill={palette.leafRight}
            />
            <path
              d="M128 21C136 19 145 16 152 13"
              stroke="#ffffff"
              strokeOpacity="0.4"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ) : null}

        {character.accessory === "star" ? (
          <g className="companion-art__accessory companion-art__accessory--star">
            <path
              d="M120 34C120 27 120 20 120 15"
              stroke={palette.stem}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="120" cy="4" r="17" fill={palette.accessoryAlt} opacity="0.3" />
            <path
              d="M120-11L123.6-3.6 131.6-2.6 125.8 2.8 127.2 10.8 120 6.8 112.8 10.8 114.2 2.8 108.4-2.6 116.4-3.6Z"
              fill={palette.accessorySoft}
              stroke={palette.accessoryAlt}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </g>
        ) : null}

        <g
          className={classNames(
            "companion-art__face",
            sad && "companion-art__face--sad",
          )}
        >
          <g className="companion-art__eyes">
            <circle cx="92" cy="107" r="18" fill={`url(#${eyeGradient})`} />
            <circle cx="148" cy="107" r="18" fill={`url(#${eyeGradient})`} />
            <circle cx="86" cy="100" r="6" fill="#ffffff" opacity="0.97" />
            <circle cx="142" cy="100" r="6" fill="#ffffff" opacity="0.97" />
            <circle cx="99" cy="114" r="2.6" fill="#ffffff" opacity="0.82" />
            <circle cx="155" cy="114" r="2.6" fill="#ffffff" opacity="0.82" />
            <path
              className="companion-art__lid"
              d="M74 91C82 84 100 84 108 91"
              stroke={palette.eyeDeep}
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              opacity="0"
            />
            <path
              className="companion-art__lid"
              d="M132 91C140 84 158 84 166 91"
              stroke={palette.eyeDeep}
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              opacity="0"
            />
          </g>

          <ellipse cx="68" cy="131" rx="13" ry="8" fill={palette.blush} opacity="0.55" />
          <ellipse cx="172" cy="131" rx="13" ry="8" fill={palette.blush} opacity="0.55" />

          <ellipse cx="120" cy="126" rx="4.4" ry="3.2" fill={palette.nose} opacity="0.9" />

          {happy ? (
            <path
              className="companion-art__mouth"
              d="M110 138C112 146 116 150 120 150C124 150 128 146 130 138C126 141 114 141 110 138Z"
              fill={palette.mouth}
              opacity="0.88"
            />
          ) : sad ? (
            <path
              className="companion-art__mouth"
              d="M112 146C115 141 125 141 128 146"
              stroke={palette.mouth}
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
          ) : thinking ? (
            <ellipse
              className="companion-art__mouth"
              cx="120"
              cy="143"
              rx="3.2"
              ry="2.4"
              fill={palette.mouth}
              opacity="0.6"
            />
          ) : (
            <path
              className="companion-art__mouth"
              d="M112 140C115.5 144.5 124.5 144.5 128 140"
              stroke={palette.mouth}
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />
          )}
        </g>

        {thinking ? (
          <g className="companion-art__thought" fill={palette.eye}>
            <circle cx="176" cy="46" r="4" />
            <circle cx="190" cy="34" r="3.2" />
            <circle cx="202" cy="21" r="2.4" />
          </g>
        ) : null}

        {state === "listening" ? (
          <g
            className="companion-art__listen"
            stroke={palette.accent}
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          >
            <path d="M215 104C222 118 222 132 215 146" />
            <path d="M25 104C18 118 18 132 25 146" />
          </g>
        ) : null}

        {state === "encouraging" ? (
          <g className="companion-art__sparkles">
            <path
              d="M48 66C49.4 72 51.2 73.8 57 75C51.2 76.2 49.4 78 48 84C46.6 78 44.8 76.2 39 75C44.8 73.8 46.6 72 48 66Z"
              fill={palette.orb1}
            />
            <path
              d="M196 62C197.2 66.8 198.6 68.2 203 69C198.6 69.8 197.2 71.2 196 76C194.8 71.2 193.4 69.8 189 69C193.4 68.2 194.8 66.8 196 62Z"
              fill={palette.orb3}
            />
            <path
              d="M60 184C61 187.4 62 188.4 65 189C62 189.6 61 190.6 60 194C59 190.6 58 189.6 55 189C58 188.4 59 187.4 60 184Z"
              fill={palette.orb2}
            />
          </g>
        ) : null}
      </g>
    </g>
  );
}

export const COMPANION_FULL_VIEWBOX = "0 -16 240 282";
export const COMPANION_FACE_VIEWBOX = "16 -14 208 216";
