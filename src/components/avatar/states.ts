export type CompanionState =
  | "idle"
  | "listening"
  | "thinking"
  | "responding"
  | "encouraging"
  | "error";

const STATE_DESCRIPTION: Record<CompanionState, string> = {
  idle: "is resting quietly.",
  listening: "is listening.",
  thinking: "is thinking.",
  responding: "has replied.",
  encouraging: "is here with you.",
  error: "is quiet while the connection recovers.",
};

export function companionStateLabel(
  state: CompanionState,
  name = "Lumi",
): string {
  return `${name} ${STATE_DESCRIPTION[state]}`;
}

interface StateStyle {
  bobAmplitude: number;
  bobSpeed: number;
  tilt: number;
  eyeOpen: number;
  smile: number;
  orbitSpeed: number;
  glowOpacity: number;
  lookUp: number;
}

export const COMPANION_STYLES: Record<CompanionState, StateStyle> = {
  idle: {
    bobAmplitude: 0.055,
    bobSpeed: 1.1,
    tilt: 0,
    eyeOpen: 1,
    smile: 0.65,
    orbitSpeed: 0.28,
    glowOpacity: 0.22,
    lookUp: 0,
  },
  listening: {
    bobAmplitude: 0.04,
    bobSpeed: 1.5,
    tilt: 0.07,
    eyeOpen: 1.18,
    smile: 0.55,
    orbitSpeed: 0.55,
    glowOpacity: 0.3,
    lookUp: 0.02,
  },
  thinking: {
    bobAmplitude: 0.025,
    bobSpeed: 2,
    tilt: -0.06,
    eyeOpen: 0.72,
    smile: 0.2,
    orbitSpeed: 1.05,
    glowOpacity: 0.24,
    lookUp: 0.055,
  },
  responding: {
    bobAmplitude: 0.075,
    bobSpeed: 1.6,
    tilt: 0.03,
    eyeOpen: 1.05,
    smile: 0.9,
    orbitSpeed: 0.45,
    glowOpacity: 0.34,
    lookUp: 0,
  },
  encouraging: {
    bobAmplitude: 0.06,
    bobSpeed: 0.95,
    tilt: 0.05,
    eyeOpen: 0.92,
    smile: 0.95,
    orbitSpeed: 0.22,
    glowOpacity: 0.38,
    lookUp: 0,
  },
  error: {
    bobAmplitude: 0.018,
    bobSpeed: 0.8,
    tilt: 0,
    eyeOpen: 0.8,
    smile: -0.15,
    orbitSpeed: 0.12,
    glowOpacity: 0.14,
    lookUp: 0,
  },
};
