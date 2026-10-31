import { Link } from "react-router-dom";
import type { AssessmentResult } from "@/types";
import { useCompanion } from "@/hooks/useCompanion";
import { CompanionAvatar } from "@/components/avatar/CompanionAvatar";
import {
  Badge,
  Button,
  Card,
  CardHeader,
} from "@/components/ui";
import {
  ArrowRightIcon,
  ChatIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/ui/icons";
import {
  asRecord,
  numberFrom,
  prettyLevel,
  stringFrom,
} from "./assessmentSections";
import { DemoNote } from "@/components/demo/DemoNote";

export function AssessmentResultView({
  result,
  onRetake,
  retaking,
}: {
  result: AssessmentResult;
  onRetake: () => void;
  retaking: boolean;
}) {
  const { name: companionName } = useCompanion();
  const data = asRecord(result.result_data);
  const overall =
    stringFrom(asRecord(data?.overall), "level") ?? result.severity_level;
  const who5 = asRecord(data?.who5);
  const gad7 = asRecord(data?.gad7);
  const mood = asRecord(data?.mood);
  const stress = asRecord(data?.stress);
  const safety = asRecord(data?.safety);
  const safetyFlag = safety?.risk_flag === true;

  return (
    <div className="assessment-result">
      <DemoNote>
        Demo mode: this is a fixed sample result for illustration. It does not
        reflect your answers and is not a screening of you.
      </DemoNote>

      <Card className="assessment-result__hero">
        <div className="assessment-result__copy">
          <p className="eyebrow">
            <SparkIcon size={15} /> Overall screening indication
          </p>
          <h2>{prettyLevel(overall)}</h2>
          <p className="assessment-result__interpretation">
            {result.interpretation}
          </p>
          <div className="assessment-result__meta">
            <Badge tone="neutral">
              Assessment ID {result.assessment_id.slice(0, 8)}
            </Badge>
            <Badge tone="brand">{prettyLevel(result.severity_level)}</Badge>
          </div>
        </div>
        <CompanionAvatar state="encouraging" size="lg" />
      </Card>

      {safetyFlag ? (
        <Card className="assessment-safety">
          <div className="assessment-safety__icon" aria-hidden="true">
            <ShieldIcon size={22} />
          </div>
          <div>
            <h2>A note about safety</h2>
            <p>
              Your answer to the safety question indicates that extra support
              may be important right now. This screening cannot assess risk on
              its own. Please consider contacting a trusted person, a local
              emergency service, or a qualified professional — and if you are
              in immediate danger, contact emergency services now.
            </p>
            <div className="assessment-safety__actions">
              <Link
                to="/professionals"
                className="btn btn--primary btn--sm"
              >
                <span>Find a professional</span>
                <ArrowRightIcon size={15} />
              </Link>
              <Link to="/chat" className="btn btn--secondary btn--sm">
                <ChatIcon size={15} />
                <span>Talk with {companionName}</span>
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="assessment-scores">
        <Card className="assessment-score">
          <span className="eyebrow">Wellbeing</span>
          <h3>WHO-5</h3>
          <strong>
            {numberFrom(who5, "percentage_score") ?? "—"}
            <span>%</span>
          </strong>
          <p>
            Raw score {numberFrom(who5, "raw_score") ?? "—"} of 25 ·{" "}
            {prettyLevel(stringFrom(who5, "level"))}
          </p>
        </Card>

        <Card className="assessment-score">
          <span className="eyebrow">Anxiety</span>
          <h3>GAD-7</h3>
          <strong>
            {numberFrom(gad7, "total_score") ?? "—"}
            <span>/21</span>
          </strong>
          <p>{prettyLevel(stringFrom(gad7, "severity_level"))}</p>
        </Card>

        <Card className="assessment-score">
          <span className="eyebrow">Mood</span>
          <h3>Recent low mood</h3>
          <strong>
            {numberFrom(mood, "score") ?? "—"}
            <span>/3</span>
          </strong>
          <p>{prettyLevel(stringFrom(mood, "level"))}</p>
        </Card>

        <Card className="assessment-score">
          <span className="eyebrow">Stress</span>
          <h3>Daily overwhelm</h3>
          <strong>
            {numberFrom(stress, "score") ?? "—"}
            <span>/3</span>
          </strong>
          <p>{prettyLevel(stringFrom(stress, "level"))}</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          eyebrow="What now"
          title="A few gentle next steps"
          subtitle="Results are stored in your account. This interface does not re-open previous result details."
        />
        <div className="assessment-next">
          <div>
            <h3>Keep noticing</h3>
            <p>
              A daily mood check-in gives context a one-off screening cannot.
              One honest number is enough.
            </p>
            <Link to="/mood" className="text-button text-button--arrow">
              Open mood tracker <ArrowRightIcon size={15} />
            </Link>
          </div>
          <div>
            <h3>Talk it through</h3>
            <p>
              {companionName} can help you think about what these results bring
              up. It offers supportive guidance, not treatment.
            </p>
            <Link to="/chat" className="text-button text-button--arrow">
              Open companion <ArrowRightIcon size={15} />
            </Link>
          </div>
          <div>
            <h3>Professional support</h3>
            <p>
              If these results reflect how daily life feels, a qualified
              professional can offer a fuller assessment.
            </p>
            <Link
              to="/professionals"
              className="text-button text-button--arrow"
            >
              Browse professionals <ArrowRightIcon size={15} />
            </Link>
          </div>
        </div>
        <div className="assessment-result__footer">
          <Button
            variant="secondary"
            onClick={onRetake}
            loading={retaking}
          >
            Take the assessment again
          </Button>
          <Link to="/dashboard" className="btn btn--ghost btn--md">
            Back to today
          </Link>
        </div>
      </Card>

      <p className="assessment-disclaimer">
        This screening is not a medical diagnosis. It reflects only the answers
        you gave today. If you are worried about your mental health, please
        speak with a qualified professional.
      </p>
    </div>
  );
}
