import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchAssessmentStatus,
  startAssessment,
  submitAssessment,
} from "@/api/assessment";
import { useAuth } from "@/hooks/useAuth";
import { describeApiError } from "@/lib/errors";
import type {
  AssessmentResult,
  AssessmentSession,
  AssessmentStatus,
} from "@/types";
import { PageHeader } from "@/components/ui";
import { AssessmentIntro } from "./AssessmentIntro";
import { AssessmentResultView } from "./AssessmentResultView";
import { AssessmentRunner } from "./AssessmentRunner";

export default function AssessmentPage() {
  const { user } = useAuth();
  const canTakeAssessment = user?.role === "user";

  const [status, setStatus] = useState<AssessmentStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");

  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError("");
    try {
      const next = await fetchAssessmentStatus();
      setStatus(next);
    } catch (error) {
      setStatusError(
        describeApiError(
          error,
          "We couldn’t check your assessment status right now.",
        ).message,
      );
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (session || result) window.scrollTo(0, 0);
  }, [session, result]);

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    setStartError("");
    setSubmitError("");
    setResult(null);

    try {
      const next = await startAssessment();
      setSession(next);
    } catch (error) {
      const info = describeApiError(
        error,
        "We couldn’t start the assessment. Please try again.",
      );
      setStartError(
        info.status === 403
          ? "This screening is available to member accounts. If you think this is a mistake, contact an administrator."
          : info.message,
      );
    } finally {
      setStarting(false);
    }
  };

  const handleSubmit = async (answers: Record<string, number>) => {
    if (!session || submitting) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = session.questions.map((question) => ({
        question_code: question.code,
        answer_value: answers[question.code],
      }));
      const next = await submitAssessment(session.assessment_id, payload);
      setResult(next);
      setSession(null);
      void loadStatus();
    } catch (error) {
      setSubmitError(
        describeApiError(
          error,
          "We couldn’t submit your assessment. Your answers are still on this screen — please try again.",
        ).message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    void handleStart();
  };

  return (
    <div className={result ? "stack stack--lg" : "assessment-page"}>
      {result ? (
        <PageHeader
          eyebrow="Screening, not a diagnosis"
          title="Your screening result"
          description="A snapshot of your responses, with a reminder that screening tools cannot diagnose anything on their own."
          actions={
            <Link to="/dashboard" className="btn btn--secondary btn--md">
              <span>Back to today</span>
            </Link>
          }
        />
      ) : null}

      {result ? (
        <AssessmentResultView
          result={result}
          onRetake={handleRetake}
          retaking={starting}
        />
      ) : session ? (
        <AssessmentRunner
          key={session.assessment_id}
          session={session}
          submitting={submitting}
          submitError={submitError}
          onSubmit={(answers) => void handleSubmit(answers)}
        />
      ) : (
        <AssessmentIntro
          status={status}
          statusLoading={statusLoading}
          statusError={statusError}
          starting={starting}
          startError={
            canTakeAssessment
              ? startError
              : "Assessments are available to member accounts. This portal uses a different role."
          }
          onStart={() => void handleStart()}
        />
      )}
    </div>
  );
}
