import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ProgressBar,
} from "@/components/ui";
import {
  ArrowLeftIcon,
  PauseIcon,
  PlayIcon,
  SlidersIcon,
  SparkIcon,
  StopIcon,
  TimerIcon,
} from "@/components/ui/icons";
import { useCompanion } from "@/hooks/useCompanion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { classNames } from "@/lib/utils";
import { BreathingScene } from "./RelaxArt";
import { MeditationScene } from "./SessionArt";
import type { BreathPattern } from "./sessions";
import { formatDuration } from "./tracks";

type PhaseKind = "in" | "hold" | "out";

interface BreathPhase {
  kind: PhaseKind;
  label: string;
  cue: string;
  seconds: number;
}

const INHALE_SECONDS = 4;
const HOLD_SECONDS = 4;
const EXHALE_SECONDS = 4;

const EMBEDDED_CHOICES = [60, 180, 300] as const;
const SCREEN_CHOICES = [120, 300, 600, 900] as const;

function sessionLabel(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

function buildPhases(pattern: BreathPattern): BreathPhase[] {
  const inhale: BreathPhase = {
    kind: "in",
    label: "Breathe in",
    cue: "Breathe in slowly through the nose.",
    seconds: INHALE_SECONDS,
  };
  const hold: BreathPhase = {
    kind: "hold",
    label: "Hold",
    cue: "A gentle pause — let go sooner if you need to.",
    seconds: HOLD_SECONDS,
  };
  const exhale: BreathPhase = {
    kind: "out",
    label: "Breathe out",
    cue: "Breathe out long and unhurried.",
    seconds: EXHALE_SECONDS,
  };

  if (pattern === "box") {
    return [
      inhale,
      hold,
      exhale,
      {
        ...hold,
        cue: "Stay soft at the bottom. Your next breath is coming.",
      },
    ];
  }
  return [inhale, hold, exhale];
}

type Panel = "" | "duration" | "settings";

interface BreathingExerciseProps {
  variant?: "embedded" | "screen";
  initialPattern?: BreathPattern;
}

export function BreathingExercise({
  variant = "embedded",
  initialPattern = "calm",
}: BreathingExerciseProps) {
  const { character } = useCompanion();
  const [pattern, setPattern] = useState<BreathPattern>(initialPattern);
  const [sessionSeconds, setSessionSeconds] = useState<number>(
    variant === "screen" ? 300 : 180,
  );
  const [panel, setPanel] = useState<Panel>("");
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(INHALE_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const reducedMotion = useReducedMotion();

  const phases = useMemo(() => buildPhases(pattern), [pattern]);
  const phasesRef = useRef(phases);
  phasesRef.current = phases;
  const sessionSecondsRef = useRef<number>(sessionSeconds);
  sessionSecondsRef.current = sessionSeconds;

  const phaseIndexRef = useRef(0);
  const phaseEndsAtRef = useRef(0);
  const sessionEndsAtRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    setPattern(initialPattern);
  }, [initialPattern]);

  const stopTick = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const finishSession = useCallback(() => {
    stopTick();
    runningRef.current = false;
    setRunning(false);
    setStarted(false);
    setCompleted(true);
    setElapsed(sessionSecondsRef.current);
    setPhaseRemaining(0);
  }, [stopTick]);

  const runTick = useCallback(() => {
    const now = Date.now();
    if (now >= sessionEndsAtRef.current) {
      finishSession();
      return;
    }
    const list = phasesRef.current;
    let guard = 0;
    while (now >= phaseEndsAtRef.current && guard < list.length * 4) {
      const nextIndex = (phaseIndexRef.current + 1) % list.length;
      if (nextIndex === 0) setCycles((value) => value + 1);
      phaseIndexRef.current = nextIndex;
      phaseEndsAtRef.current += list[nextIndex].seconds * 1000;
      setPhaseIndex(nextIndex);
      guard += 1;
    }
    setPhaseRemaining(Math.max(0, (phaseEndsAtRef.current - now) / 1000));
    setElapsed(
      Math.min(
        sessionSecondsRef.current,
        sessionSecondsRef.current -
          (sessionEndsAtRef.current - now) / 1000,
      ),
    );
  }, [finishSession]);

  const start = useCallback(() => {
    stopTick();
    const list = phasesRef.current;
    const now = Date.now();
    phaseIndexRef.current = 0;
    phaseEndsAtRef.current = now + list[0].seconds * 1000;
    sessionEndsAtRef.current = now + sessionSecondsRef.current * 1000;
    setPhaseIndex(0);
    setPhaseRemaining(list[0].seconds);
    setElapsed(0);
    setCycles(0);
    setCompleted(false);
    setStarted(true);
    setRunning(true);
    setPanel("");
    runningRef.current = true;
    intervalRef.current = window.setInterval(runTick, 120);
  }, [runTick, stopTick]);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    const now = Date.now();
    stopTick();
    runningRef.current = false;
    setRunning(false);
    setPhaseRemaining(Math.max(0, (phaseEndsAtRef.current - now) / 1000));
    setElapsed(
      Math.min(
        sessionSecondsRef.current,
        Math.max(
          0,
          sessionSecondsRef.current -
            (sessionEndsAtRef.current - now) / 1000,
        ),
      ),
    );
  }, [stopTick]);

  const resume = useCallback(() => {
    if (runningRef.current) return;
    const now = Date.now();
    phaseEndsAtRef.current = now + Math.max(0.05, phaseRemaining) * 1000;
    sessionEndsAtRef.current =
      now + Math.max(0.05, sessionSecondsRef.current - elapsed) * 1000;
    runningRef.current = true;
    setRunning(true);
    intervalRef.current = window.setInterval(runTick, 120);
  }, [elapsed, phaseRemaining, runTick]);

  const reset = useCallback(() => {
    stopTick();
    runningRef.current = false;
    setRunning(false);
    setStarted(false);
    setCompleted(false);
    setPhaseIndex(0);
    setPhaseRemaining(phasesRef.current[0].seconds);
    setElapsed(0);
    setCycles(0);
    setPanel("");
  }, [stopTick]);

  useEffect(() => {
    if (started) return;
    setPhaseIndex(0);
    setPhaseRemaining(phases[0].seconds);
  }, [phases, started]);

  useEffect(() => () => stopTick(), [stopTick]);

  const phase = phases[phaseIndex] ?? phases[0];
  const progress = Math.min(sessionSeconds, Math.max(0, elapsed));
  const countdown = Math.max(0, Math.ceil(phaseRemaining));
  const status = completed
    ? "Complete"
    : running
      ? "Breathing"
      : started
        ? "Paused"
        : "Ready";

  const cue = completed
    ? `Session complete. You moved through ${cycles} ${
        cycles === 1 ? "cycle" : "cycles"
      }. Let your breath return to its own rhythm.`
    : running
      ? phase.cue
      : started
        ? "Paused. Resume whenever you are ready."
        : "Press start, then follow the circle at your own pace.";

  const phaseProgress = started
    ? Math.min(1, Math.max(0, 1 - phaseRemaining / phase.seconds))
    : 0;
  const circumference = 2 * Math.PI * 88;

  if (variant === "screen") {
    const minutes = Math.round(sessionSeconds / 60);
    const controlsLabel = running
      ? "Pause breathing"
      : started
        ? "Resume breathing"
        : completed
          ? "Breathe again"
          : "Start breathing";

    return (
      <div className="rx-screen rx-breathing-screen">
        <header className="rx-head">
          <Link to="/relax" className="rx-back" aria-label="Back to Relax and Listen">
            <ArrowLeftIcon size={19} />
          </Link>
          <div className="rx-head__title">
            <h1>Breathing Exercise</h1>
          </div>
          <span className="rx-head__spark" aria-hidden="true">
            <SparkIcon size={19} />
          </span>
        </header>

        <div className="rx-breathing__intro">
          <h2>{pattern === "box" ? "Box Breathing" : "Calm Breathing"}</h2>
          <p>Find your calm in just a few minutes.</p>
        </div>

        <div className="rx-breathing__stage">
          <MeditationScene
            phase={phase.kind}
            started={started}
            running={running}
            completed={completed}
            className={reducedMotion ? "rx-breathing__scene--still" : ""}
          />

          <div
            className="rx-orb"
            data-phase={phase.kind}
            data-started={started}
            data-running={running}
            data-completed={completed}
          >
            <span className="rx-orb__glow" aria-hidden="true" />
            <svg
              viewBox="0 0 200 200"
              className="rx-orb__ring"
              aria-hidden="true"
            >
              <circle className="rx-orb__track" cx="100" cy="100" r="88" />
              <circle
                className="rx-orb__value"
                cx="100"
                cy="100"
                r="88"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - phaseProgress)}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="rx-orb__label" aria-live="polite">
              <strong>
                {completed
                  ? "Complete"
                  : started
                    ? phase.label
                    : "Breathe In"}
              </strong>
              <span>
                {completed
                  ? `${cycles} ${cycles === 1 ? "cycle" : "cycles"}`
                  : `${started ? countdown : INHALE_SECONDS}s`}
              </span>
              {!started && !completed ? (
                <small>
                  {pattern === "box" ? "Box 4·4·4·4" : "Calm 4·4·4"}
                </small>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rx-breath-controls">
          <button
            type="button"
            className="rx-tool"
            aria-label={`Session length: ${minutes} minutes`}
            aria-expanded={panel === "duration"}
            onClick={() =>
              setPanel((value) => (value === "duration" ? "" : "duration"))
            }
          >
            <TimerIcon size={19} />
            <span>{minutes} min</span>
          </button>

          <button
            type="button"
            className="rx-play"
            aria-label={controlsLabel}
            onClick={() => {
              if (!started) {
                start();
                return;
              }
              if (running) {
                pause();
              } else {
                resume();
              }
            }}
          >
            {running ? <PauseIcon size={27} /> : <PlayIcon size={26} />}
          </button>

          <button
            type="button"
            className="rx-tool"
            aria-label="Breathing settings"
            aria-expanded={panel === "settings"}
            onClick={() =>
              setPanel((value) => (value === "settings" ? "" : "settings"))
            }
          >
            <SlidersIcon size={19} />
          </button>
        </div>

        {panel === "duration" ? (
          <div className="rx-panel" aria-label="Session length options">
            {SCREEN_CHOICES.map((value) => (
              <button
                key={value}
                type="button"
                className={classNames(
                  "rx-chip",
                  sessionSeconds === value && "rx-chip--active",
                )}
                aria-pressed={sessionSeconds === value}
                disabled={started}
                onClick={() => setSessionSeconds(value)}
              >
                {sessionLabel(value)}
              </button>
            ))}
          </div>
        ) : null}

        {panel === "settings" ? (
          <div className="rx-panel rx-panel--stack" aria-label="Breathing settings">
            <div className="rx-panel__row">
              {(["calm", "box"] as BreathPattern[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={classNames(
                    "rx-chip",
                    pattern === value && "rx-chip--active",
                  )}
                  aria-pressed={pattern === value}
                  disabled={started}
                  onClick={() => setPattern(value)}
                >
                  {value === "calm" ? "Calm · 4·4·4" : "Box · 4·4·4·4"}
                </button>
              ))}
            </div>
            <p className="rx-panel__note">
              Inhale, hold and exhale for four seconds each. Box breathing adds
              a second gentle hold. Stop or shorten any hold that feels
              uncomfortable.
            </p>
            {started ? (
              <button type="button" className="rx-link" onClick={reset}>
                End this session
              </button>
            ) : null}
          </div>
        ) : null}

        <p className="rx-breath-cue" aria-live="polite">
          {cue}
        </p>
        <p className="rx-safety">
          Breathe only as deeply as feels comfortable. Never force a hold, and
          stop if you feel dizzy, tingly, or short of breath. This is a
          self-care exercise, not a treatment.
        </p>
      </div>
    );
  }

  return (
    <Card className="breathing" as="section">
      <CardHeader
        eyebrow="Breathing exercise"
        title="Breathe with the circle"
        subtitle="Find your calm in just a few minutes."
        action={
          <Badge
            tone={completed ? "success" : started ? "brand" : "neutral"}
            dot
          >
            {status}
          </Badge>
        }
      />

      <div className="breathing__layout">
        <div
          className={classNames(
            "breathing__stage",
            reducedMotion && "breathing__stage--still",
          )}
        >
          <BreathingScene
            phase={phase.kind}
            started={started}
            running={running}
            completed={completed}
            character={character}
          />

          <div
            className="breath-dial"
            data-phase={phase.kind}
            data-started={started}
            data-running={running}
            data-completed={completed}
            aria-hidden="true"
          >
            <span className="breath-dial__halo" />
            <span className="breath-dial__ring" />
            <span className="breath-dial__orbit" />
            <div className="breath-dial__label">
              <strong>
                {completed
                  ? "Complete"
                  : started
                    ? phase.label
                    : "Breathe In"}
              </strong>
              <span>
                {completed
                  ? `${cycles} ${cycles === 1 ? "cycle" : "cycles"}`
                  : `${started ? countdown : INHALE_SECONDS}s`}
              </span>
            </div>
          </div>
        </div>

        <div className="breathing__panel">
          <div
            className="breathing__choices"
            role="group"
            aria-label="Session length"
          >
            {EMBEDDED_CHOICES.map((value) => (
              <button
                key={value}
                type="button"
                className={classNames(
                  "chip",
                  sessionSeconds === value && "chip--active",
                )}
                aria-pressed={sessionSeconds === value}
                onClick={() => setSessionSeconds(value)}
                disabled={started}
              >
                {value === 60 ? "1 minute" : `${value / 60} minutes`}
              </button>
            ))}
          </div>

          <p className="breathing__pattern">
            {INHALE_SECONDS}s in · {HOLD_SECONDS}s hold ·{" "}
            {EXHALE_SECONDS}s out
            {pattern === "box" ? ` · ${HOLD_SECONDS}s hold` : ""}
            {started ? <span> · round {cycles + 1}</span> : null}
          </p>

          <div className="breathing__choices" role="group" aria-label="Breathing pattern">
            {(["calm", "box"] as BreathPattern[]).map((value) => (
              <button
                key={value}
                type="button"
                className={classNames(
                  "chip",
                  pattern === value && "chip--active",
                )}
                aria-pressed={pattern === value}
                onClick={() => setPattern(value)}
                disabled={started}
              >
                {value === "calm" ? "Calm · 4·4·4" : "Box · 4·4·4·4"}
              </button>
            ))}
          </div>

          <ProgressBar
            value={Math.floor(progress)}
            max={sessionSeconds}
            label="Breathing session progress"
          />
          <div className="breathing__time">
            <span>{formatDuration(progress)}</span>
            <span>{formatDuration(sessionSeconds)}</span>
          </div>

          <p className="breathing__cue" aria-live="polite">
            {cue}
          </p>

          <div className="breathing__controls">
            {started ? (
              <>
                <Button
                  onClick={running ? pause : resume}
                  leftIcon={
                    running ? (
                      <PauseIcon size={16} />
                    ) : (
                      <PlayIcon size={16} />
                    )
                  }
                >
                  {running ? "Pause" : "Resume"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={reset}
                  leftIcon={<StopIcon size={15} />}
                >
                  End
                </Button>
              </>
            ) : (
              <Button onClick={start} leftIcon={<PlayIcon size={16} />}>
                {completed ? "Breathe again" : "Start breathing"}
              </Button>
            )}
          </div>

          <p className="breathing__safety">
            Breathe only as deeply as feels comfortable. Never force a hold,
            and stop if you feel dizzy, tingly, or short of breath. This is a
            self-care exercise, not a treatment.
          </p>
        </div>
      </div>
    </Card>
  );
}
