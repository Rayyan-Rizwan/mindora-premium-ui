import type { CompanionCharacter } from "@/lib/companion";
import { classNames } from "@/lib/utils";
import {
  COMPANION_FACE_VIEWBOX,
  CompanionFigure,
} from "./CompanionFigure";
import type { CompanionState } from "./states";

type MiniState = "idle" | "responding" | "thinking";

function toFigureState(state: MiniState): CompanionState {
  if (state === "thinking") return "thinking";
  if (state === "responding") return "responding";
  return "idle";
}

/**
 * Compact bust of the canonical companion for chat rows. Same head, eyes,
 * cheeks and accessory as the large avatar — only the crop is smaller.
 */
export function CompanionMini({
  character,
  state = "responding",
  speaking = false,
  className,
}: {
  character: CompanionCharacter;
  state?: MiniState;
  speaking?: boolean;
  className?: string;
}) {
  return (
    <span
      className={classNames("companion-mini", className)}
      data-character={character.id}
      data-state={state}
      data-speaking={speaking || undefined}
      aria-hidden="true"
    >
      <svg viewBox={COMPANION_FACE_VIEWBOX} role="presentation">
        <g className="companion-mini__float">
          <CompanionFigure
            character={character}
            state={toFigureState(state)}
            variant="face"
          />
        </g>
      </svg>
    </span>
  );
}
