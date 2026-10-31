import { useCompanion } from "@/hooks/useCompanion";
import type { CompanionCharacter } from "@/lib/companion";
import { classNames } from "@/lib/utils";
import {
  COMPANION_FULL_VIEWBOX,
  CompanionFigure,
} from "./CompanionFigure";
import { companionStateLabel, type CompanionState } from "./states";

export interface CompanionAvatarProps {
  state?: CompanionState;
  size?: "sm" | "md" | "lg" | "hero";
  character?: CompanionCharacter;
  className?: string;
}

/**
 * One reusable companion for every screen. It is a single SVG drawing scaled
 * by size only, so the face, body, palette and accessory never drift between
 * the dashboard, chat, voice, assessment, settings or the auth scene.
 */
export function CompanionAvatar({
  state = "idle",
  size = "md",
  character: characterOverride,
  className,
}: CompanionAvatarProps) {
  const { character: savedCharacter } = useCompanion();
  const character = characterOverride ?? savedCharacter;
  const stateLabel = companionStateLabel(state, character.name);

  return (
    <div
      className={classNames("companion", `companion--${size}`, className)}
      data-state={state}
      data-character={character.id}
      role="img"
      aria-label={`${character.name}, the Mindora companion. ${stateLabel}`}
    >
      <div className={classNames("companion-art", `companion-art--${state}`)}>
        <svg viewBox={COMPANION_FULL_VIEWBOX} role="presentation">
          <CompanionFigure character={character} state={state} />
        </svg>
      </div>
      <span className="sr-only" aria-live="polite">
        {stateLabel}
      </span>
    </div>
  );
}
