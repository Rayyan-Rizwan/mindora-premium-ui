import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, PlayIcon, SparkIcon } from "@/components/ui/icons";
import { BreathingExercise } from "./BreathingExercise";
import { SessionArt } from "./SessionArt";
import {
  RELAX_FILTERS,
  sessionsForFilter,
  type CuratedSession,
  type RelaxFilter,
} from "./sessions";
import { CATEGORY_LABEL } from "./tracks";

export default function RelaxPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<RelaxFilter>("all");

  const visible = useMemo(() => sessionsForFilter(filter), [filter]);

  const openSession = (session: CuratedSession) => {
    if (session.kind === "breathing") {
      navigate(`/relax/breathing?pattern=${session.pattern ?? "calm"}`);
      return;
    }
    navigate(`/listen?track=${session.id}`);
  };

  return (
    <div className="rx-screen rx-relax-screen">
      <header className="rx-head">
        <Link to="/dashboard" className="rx-back" aria-label="Back to today">
          <ArrowLeftIcon size={19} />
        </Link>
        <div className="rx-head__title">
          <h1>Relax</h1>
          <p>Take a break. Your mind will thank you.</p>
        </div>
        <span className="rx-head__spark" aria-hidden="true">
          <SparkIcon size={19} />
        </span>
      </header>

      <div
        className="rx-filters"
        role="group"
        aria-label="Filter relaxation sessions"
      >
        {RELAX_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            className="rx-filter"
            aria-pressed={filter === item.value}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rx-track-list">
        {visible.map((session) => (
          <button
            key={session.id}
            type="button"
            className="rx-track"
            onClick={() => openSession(session)}
            aria-label={`Open ${session.title}`}
          >
            <span className="rx-track__art" aria-hidden="true">
              <SessionArt id={session.id} />
            </span>
            <span className="rx-track__copy">
              <strong>{session.title}</strong>
              <span>
                {session.durationLabel} · {CATEGORY_LABEL[session.category]}
              </span>
            </span>
            <span className="rx-track__play" aria-hidden="true">
              <PlayIcon size={15} />
            </span>
          </button>
        ))}
      </div>

      <BreathingExercise />

      <p className="relax-disclaimer">
        Relax &amp; Listen is a self-care space, not a treatment for any
        condition. If you feel unwell or unsafe, contact local emergency
        services or a trusted professional.
      </p>
    </div>
  );
}
