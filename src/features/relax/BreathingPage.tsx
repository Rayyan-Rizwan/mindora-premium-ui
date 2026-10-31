import { useSearchParams } from "react-router-dom";
import { BreathingExercise } from "./BreathingExercise";
import type { BreathPattern } from "./sessions";

export default function BreathingPage() {
  const [params] = useSearchParams();
  const pattern: BreathPattern =
    params.get("pattern") === "box" ? "box" : "calm";

  return <BreathingExercise variant="screen" initialPattern={pattern} />;
}
