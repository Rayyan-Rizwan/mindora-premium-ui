import { useEffect, useMemo, useRef, useState } from "react";
import type { AssessmentSession } from "@/types";
import { CompanionAvatar } from "@/components/avatar/CompanionAvatar";
import {
  Alert,
  Button,
  Card,
  ProgressBar,
} from "@/components/ui";
import {
  ArrowRightIcon,
  CheckIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { classNames } from "@/lib/utils";
import { buildSections, type AssessmentSection } from "./assessmentSections";

export function AssessmentRunner({
  session,
  submitting,
  submitError,
  onSubmit,
}: {
  session: AssessmentSession;
  submitting: boolean;
  submitError: string;
  onSubmit: (answers: Record<string, number>) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const questionRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(
    () => buildSections(session.questions),
    [session.questions],
  );
  const currentSection = sections[step];
  const isLastStep = step === sections.length - 1;
  const totalQuestions = session.questions.length;
  const answeredCount = session.questions.filter(
    (question) => answers[question.code] !== undefined,
  ).length;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  if (!currentSection) return null;

  const isComplete = (section: AssessmentSection) =>
    section.questions.every(
      (question) => answers[question.code] !== undefined,
    );

  const scrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goNext = () => {
    if (!isComplete(currentSection)) {
      setStepError(
        "Please answer every question in this section before continuing.",
      );
      const firstUnanswered = currentSection.questions.find(
        (question) => answers[question.code] === undefined,
      );
      if (firstUnanswered) {
        questionRef.current
          ?.querySelector<HTMLInputElement>(
            `input[name="q-${firstUnanswered.code}"]`,
          )
          ?.focus();
      }
      return;
    }
    setStepError("");
    setStep((current) => Math.min(current + 1, sections.length - 1));
    scrollTop();
  };

  const goPrevious = () => {
    setStepError("");
    setStep((current) => Math.max(current - 1, 0));
    scrollTop();
  };

  const submit = () => {
    if (!sections.every(isComplete)) {
      setStepError("Please answer every question before submitting.");
      return;
    }
    setStepError("");
    onSubmit(answers);
  };

  return (
    <div className="assessment-runner" ref={topRef}>
      <Card className="assessment-progress">
        <div className="assessment-progress__head">
          <div>
            <p className="eyebrow">In progress</p>
            <h2>{session.assessment_type.replace(/_/g, " ")}</h2>
          </div>
          <span className="assessment-progress__count" aria-live="polite">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
        <ProgressBar
          value={answeredCount}
          max={totalQuestions}
          label="Assessment progress"
        />
        <ol className="assessment-steps">
          {sections.map((section, index) => (
            <li
              key={section.key}
              className={classNames(
                "assessment-step",
                index === step && "assessment-step--current",
                index < step &&
                  isComplete(section) &&
                  "assessment-step--done",
              )}
              aria-current={index === step ? "step" : undefined}
            >
              <span className="assessment-step__dot" aria-hidden="true">
                {index < step && isComplete(section) ? (
                  <CheckIcon size={12} />
                ) : (
                  index + 1
                )}
              </span>
              <span>{section.title}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div ref={questionRef}>
        <Card className="assessment-question-card">
          <div className="assessment-question-card__head">
            <div>
              <p className="eyebrow">
                Section {step + 1} of {sections.length}
                {currentSection.note ? ` · ${currentSection.note}` : ""}
              </p>
              <h2>{currentSection.title}</h2>
              <p>{currentSection.description}</p>
            </div>
            <CompanionAvatar
              state={
                submitting
                  ? "thinking"
                  : stepError
                    ? "error"
                    : "listening"
              }
              size="sm"
            />
          </div>

          {currentSection.key === "SAFETY" ? (
            <div className="assessment-safety-note">
              <ShieldIcon size={18} />
              <p>
                This question is asked so support can be pointed in the right
                direction. You can answer honestly. If you are in immediate
                danger, please contact local emergency services.
              </p>
            </div>
          ) : null}

          <div className="assessment-questions">
            {currentSection.questions.map((question) => {
              const index =
                session.questions.findIndex(
                  (item) => item.code === question.code,
                ) + 1;
              return (
                <fieldset key={question.code} className="assessment-question">
                  <legend>
                    <span>{index}.</span> {question.question}
                  </legend>
                  <div
                    className={classNames(
                      "assessment-options",
                      question.options.length >= 6 &&
                        "assessment-options--six",
                    )}
                  >
                    {question.options.map((option) => (
                      <label
                        key={`${question.code}-${option.value}`}
                        className="assessment-option"
                      >
                        <input
                          type="radio"
                          name={`q-${question.code}`}
                          value={option.value}
                          checked={answers[question.code] === option.value}
                          onChange={() => {
                            setAnswers((current) => ({
                              ...current,
                              [question.code]: option.value,
                            }));
                            setStepError("");
                          }}
                        />
                        <span className="assessment-option__mark">
                          <CheckIcon size={12} />
                        </span>
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>

          {stepError ? <Alert tone="danger">{stepError}</Alert> : null}
          {submitError ? <Alert tone="danger">{submitError}</Alert> : null}

          <div className="assessment-nav">
            <Button
              variant="ghost"
              onClick={goPrevious}
              disabled={step === 0 || submitting}
            >
              Previous
            </Button>

            <span className="assessment-nav__hint">
              Answers stay on this screen until you submit.
            </span>

            {isLastStep ? (
              <Button
                onClick={submit}
                loading={submitting}
                disabled={answeredCount !== totalQuestions}
                leftIcon={<CheckIcon size={16} />}
              >
                Submit assessment
              </Button>
            ) : (
              <Button
                onClick={goNext}
                disabled={submitting}
                leftIcon={<ArrowRightIcon size={16} />}
              >
                Next section
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
