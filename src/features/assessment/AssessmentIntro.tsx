import { useNavigate } from "react-router-dom";
import type { AssessmentStatus } from "@/types";
import { Alert, Badge, Button, Skeleton } from "@/components/ui";
import { ArrowLeftIcon, LockIcon } from "@/components/ui/icons";
import { ClipboardCheckIcon, ClockIcon } from "@/components/ui/screenIcons";
import { AssessmentBuddy } from "./AssessmentBuddy";

const FACTS = [
  {
    id: "questions",
    icon: ClipboardCheckIcon,
    title: "15 Questions",
    detail: "Takes about 5–10 minutes",
  },
  {
    id: "privacy",
    icon: LockIcon,
    title: "Your answers are private",
    detail: "and secure",
  },
  {
    id: "skip",
    icon: ClockIcon,
    title: "You can always skip",
    detail: "and come back later",
  },
] as const;

export function AssessmentIntro({
  status,
  statusLoading,
  statusError,
  starting,
  startError,
  onStart,
}: {
  status: AssessmentStatus | null;
  statusLoading: boolean;
  statusError: string;
  starting: boolean;
  startError: string;
  onStart: () => void;
}) {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  return (
    <section className="asg-screen" aria-labelledby="asg-title">
      <button
        type="button"
        className="asg-back"
        aria-label="Go back"
        onClick={goBack}
      >
        <ArrowLeftIcon size={18} />
      </button>

      <div className="asg-hero">
        <AssessmentBuddy />
      </div>

      <div className="asg-copy">
        <h1 id="asg-title">Mental Status Assessment</h1>
        <p>
          This short assessment helps us understand your current mental
          well-being and suggest personalized support.
        </p>
      </div>

      <ul className="asg-facts">
        {FACTS.map((fact) => {
          const Icon = fact.icon;
          return (
            <li key={fact.id} className="asg-fact">
              <span className="asg-fact__icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="asg-fact__text">
                <strong>{fact.title}</strong>
                <small>{fact.detail}</small>
              </span>
            </li>
          );
        })}
      </ul>

      {statusError ? (
        <Alert tone="warning">
          {statusError} You can still begin a new screening.
        </Alert>
      ) : null}
      {startError ? <Alert tone="danger">{startError}</Alert> : null}

      <Button
        className="asg-start"
        size="lg"
        fullWidth
        loading={starting}
        onClick={onStart}
      >
        Start Assessment
      </Button>

      <div className="asg-status asg-status--after">
        {statusLoading ? (
          <div className="asg-status__loading" role="status">
            <Skeleton width={148} height={22} radius={999} />
            <span className="sr-only">Checking your assessment status</span>
          </div>
        ) : status?.completed ? (
          <Badge tone="success" dot>
            Completed previously — new submissions are saved separately
          </Badge>
        ) : (
          <Badge tone="brand" dot>
            Not completed yet
          </Badge>
        )}
      </div>

      <p className="asg-fineprint">
        The screening combines the WHO-5 wellbeing index, GAD-7 anxiety
        screener, and short mood, stress and safety items. It is not a
        diagnosis. You can leave at any point; answers are submitted only when
        you finish.
      </p>
    </section>
  );
}
