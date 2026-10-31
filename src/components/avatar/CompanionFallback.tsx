import { useId } from "react";
import {
  COMPANION_CHARACTERS,
  type CompanionCharacter,
} from "@/lib/companion";
import { companionStateLabel, type CompanionState } from "./states";

/**
 * Illustrated companion used when WebGL is unavailable, when the canvas fails,
 * when the visitor prefers reduced motion, and in the character picker.
 */
export function CompanionFallback({
  state = "idle",
  character = COMPANION_CHARACTERS[0],
}: {
  state?: CompanionState;
  character?: CompanionCharacter;
}) {
  const gradient = useId();
  const bodyGradient = useId();
  const { palette } = character;

  return (
    <div
      className={`companion-art companion-art--${state}`}
      data-character={character.id}
      aria-hidden="true"
    >
      <span className="sr-only">
        {companionStateLabel(state, character.name)}
      </span>
      <svg viewBox="0 0 240 260" role="presentation">
        <defs>
          <radialGradient id={gradient} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.75" />
            <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={bodyGradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.bodyLight} />
            <stop offset="55%" stopColor={palette.body} />
            <stop offset="100%" stopColor={palette.bodyDeep} />
          </linearGradient>
        </defs>

        <circle cx="120" cy="120" r="96" fill={`url(#${gradient})`} />
        <ellipse
          cx="120"
          cy="228"
          rx="52"
          ry="10"
          fill={palette.shadow}
          opacity="0.12"
        />

        <g className="companion-art__body">
          {character.accessory === "ears" ? (
            <g className="companion-art__accessory companion-art__accessory--ears">
              <circle cx="74" cy="62" r="27" fill={palette.accessory} />
              <circle cx="166" cy="62" r="27" fill={palette.accessory} />
              <ellipse
                cx="74"
                cy="60"
                rx="12"
                ry="13"
                fill={palette.accessorySoft}
              />
              <ellipse
                cx="166"
                cy="60"
                rx="12"
                ry="13"
                fill={palette.accessorySoft}
              />
            </g>
          ) : null}

          <path
            d="M120 44c39 0 68 30.5 68 71 0 39-25.5 82-68 82s-68-43-68-82c0-40.5 29-71 68-71Z"
            fill={`url(#${bodyGradient})`}
          />
          <path
            d="M120 44c39 0 68 30.5 68 71 0 39-25.5 82-68 82s-68-43-68-82c0-40.5 29-71 68-71Z"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />

          {character.accessory === "sprout" ? (
            <g className="companion-art__accessory companion-art__accessory--sprout">
              <path
                d="M120 45c0-8 0-13 1-18"
                stroke={palette.accessory}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse
                cx="107"
                cy="24"
                rx="13"
                ry="6"
                fill={palette.accessorySoft}
                transform="rotate(24 107 24)"
              />
              <ellipse
                cx="134"
                cy="24"
                rx="13"
                ry="6"
                fill={palette.accessoryAlt}
                transform="rotate(-24 134 24)"
              />
            </g>
          ) : null}

          {character.accessory === "star" ? (
            <g className="companion-art__accessory companion-art__accessory--star">
              <path
                d="M120 46c0-7 0-12-1-17"
                stroke={palette.accessory}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle
                cx="119"
                cy="16"
                r="19"
                fill={palette.accessoryAlt}
                opacity="0.32"
              />
              <polygon
                points="119,3 122.8,11.2 131.8,12.2 125.2,18.2 127,27 119,22.6 111,27 112.8,18.2 106.2,12.2 115.2,11.2"
                fill={palette.accessorySoft}
                stroke={palette.accessoryAlt}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </g>
          ) : null}

          <g className="companion-art__eyes">
            <ellipse cx="99" cy="103" rx="6.5" ry="8.5" fill={palette.eye} />
            <ellipse cx="141" cy="103" rx="6.5" ry="8.5" fill={palette.eye} />
            <circle cx="101" cy="100" r="2.1" fill="#ffffff" />
            <circle cx="143" cy="100" r="2.1" fill="#ffffff" />
          </g>

          <ellipse
            cx="83"
            cy="124"
            rx="11"
            ry="6.5"
            fill={palette.blush}
            opacity="0.42"
          />
          <ellipse
            cx="157"
            cy="124"
            rx="11"
            ry="6.5"
            fill={palette.blush}
            opacity="0.42"
          />

          <path
            className="companion-art__mouth"
            d="M108 129c3.6 4.5 7.7 6.7 12 6.7s8.4-2.2 12-6.7"
            stroke={palette.mouth}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          <ellipse cx="97" cy="190" rx="15" ry="8" fill={palette.limb} />
          <ellipse cx="143" cy="190" rx="15" ry="8" fill={palette.limb} />
          <ellipse
            cx="76"
            cy="145"
            rx="9"
            ry="16"
            fill={palette.limb}
            transform="rotate(20 76 145)"
          />
          <ellipse
            cx="164"
            cy="145"
            rx="9"
            ry="16"
            fill={palette.limb}
            transform="rotate(-20 164 145)"
          />
        </g>

        <g className="companion-art__orbs">
          <circle cx="208" cy="86" r="4" fill={palette.orb1} />
          <circle cx="36" cy="132" r="3" fill={palette.orb2} />
          <circle cx="196" cy="170" r="3" fill={palette.orb3} />
        </g>
      </svg>
    </div>
  );
}
