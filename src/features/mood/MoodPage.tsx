import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchMoodSummary,
  fetchTodayMood,
  saveMood,
} from "@/api/mood";
import { describeApiError } from "@/lib/errors";
import { formatDate, formatShortDate, parseUtcDate } from "@/lib/date";
import { useCompanion } from "@/hooks/useCompanion";
import { bandForScore, describeMood, MOOD_BANDS } from "@/lib/mood";
import type { MoodRecord, MoodSummary } from "@/types";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  PageHeader,
  Skeleton,
  Textarea,
} from "@/components/ui";
import { MoodChart } from "@/components/ui/MoodChart";
import { MoodFace } from "@/components/ui/MoodFace";
import {
  ArrowRightIcon,
  CheckIcon,
  MoodIcon,
  SparkIcon,
} from "@/components/ui/icons";
import { classNames } from "@/lib/utils";
import { isDemoActive } from "@/demo/demoSession";
import { DemoNote } from "@/components/demo/DemoNote";

const NOTE_LIMIT = 500;

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="mood-stat">
      <span className="mood-stat__label">{label}</span>
      <strong>{value}</strong>
      {hint ? <span className="mood-stat__hint">{hint}</span> : null}
    </div>
  );
}

export default function MoodPage() {
  const { name: companionName } = useCompanion();
  const [today, setToday] = useState<MoodRecord | null>(null);
  const [summary, setSummary] = useState<MoodSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [hasEdited, setHasEdited] = useState(false);

  const applyToday = useCallback((record: MoodRecord | null) => {
    setToday(record);
    setScore(record?.mood_score ?? null);
    setNote(record?.note ?? "");
    setHasEdited(false);
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const next = await fetchMoodSummary();
      setSummary(next);
    } catch {
      setSummary(null);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    const [todayResult, summaryResult] = await Promise.allSettled([
      fetchTodayMood(),
      fetchMoodSummary(),
    ]);

    if (todayResult.status === "fulfilled") {
      applyToday(todayResult.value);
    }

    if (summaryResult.status === "fulfilled") {
      setSummary(summaryResult.value);
    }

    if (
      todayResult.status === "rejected" &&
      summaryResult.status === "rejected"
    ) {
      setLoadError(
        describeApiError(
          todayResult.reason,
          "We couldn’t load your mood history. Check your connection and try again.",
        ).message,
      );
    }

    setLoading(false);
  }, [applyToday]);

  useEffect(() => {
    void load();
  }, [load]);

  const [historyRange, setHistoryRange] = useState<7 | 14 | 30>(30);

  const descriptor = score ? describeMood(score) : null;
  const activeBand = score ? bandForScore(score) : null;
  const moods = useMemo(() => summary?.moods ?? [], [summary]);
  const recent = useMemo(() => {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (historyRange - 1));

    return [...moods]
      .reverse()
      .filter((entry) => parseUtcDate(entry.date).getTime() >= cutoff.getTime());
  }, [moods, historyRange]);

  const handleSave = async () => {
    if (score === null || saving) return;

    setSaving(true);
    setSaveError("");
    setSavedMessage("");

    try {
      const record = await saveMood(score, note.trim() ? note.trim() : null);
      setToday(record);
      setHasEdited(false);
      setSavedMessage(
        today
          ? "Today’s check-in has been updated. Thank you for being honest with yourself."
          : "Today’s check-in is saved. Thank you for taking this moment.",
      );
      await loadSummary();
    } catch (error) {
      setSaveError(
        describeApiError(
          error,
          "We couldn’t save your check-in. Please try again.",
        ).message,
      );
    } finally {
      setSaving(false);
    }
  };

  const changed =
    hasEdited ||
    (score !== null && score !== today?.mood_score) ||
    note.trim() !== (today?.note ?? "");

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow="A moment for you"
        title="Mood tracker"
        description="One honest number a day is enough. Your check-in is private to your account and can be updated until the day ends."
        actions={
          <Link to="/chat" className="btn btn--secondary btn--md">
            <SparkIcon size={17} />
            <span>Talk it through</span>
          </Link>
        }
      />

      {loadError ? (
        <div className="alert alert--danger" role="alert">
          <span>{loadError}</span>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : null}

      <div className="mood-grid">
        <Card className="mood-checkin">
          <CardHeader
            eyebrow={new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            title={today ? "Update today’s check-in" : "How is today feeling?"}
            subtitle="Move at your own pace. There is no score you’re supposed to choose."
            action={
              today ? (
                <Badge tone="success" dot>
                  Logged
                </Badge>
              ) : undefined
            }
          />

          {loading ? (
            <div className="skeleton-stack">
              <Skeleton width="100%" height={58} radius={18} />
              <Skeleton width="70%" height={14} />
              <Skeleton width="100%" height={92} radius={18} />
            </div>
          ) : (
            <>
              <fieldset className="mood-feelings">
                <legend className="mood-scale__legend">
                  Pick the face that fits today
                </legend>
                <div className="mood-feelings__grid">
                  {MOOD_BANDS.map((band) => (
                    <label
                      key={band.tone}
                      className="mood-feeling"
                      data-tone={band.tone}
                    >
                      <input
                        type="radio"
                        name="mood-band"
                        value={band.anchor}
                        checked={activeBand?.tone === band.tone}
                        onChange={() => {
                          setScore(band.anchor);
                          setHasEdited(true);
                          setSavedMessage("");
                          setSaveError("");
                        }}
                        aria-label={`${band.label}, ${band.range} out of 10. ${band.description}.`}
                      />
                      <MoodFace tone={band.tone} />
                      <span className="mood-feeling__label">{band.label}</span>
                      <span className="mood-feeling__range">{band.range}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {descriptor ? (
                <div
                  className="mood-selected"
                  data-tone={descriptor.tone}
                  role="status"
                  aria-live="polite"
                >
                  <MoodFace tone={descriptor.tone} size={48} animated />
                  <div className="mood-selected__body">
                    <div className="mood-selected__heading">
                      <strong>{descriptor.label}</strong>
                      <span className="mood-selected__score">
                        {score} / 10
                      </span>
                    </div>
                    <p>{descriptor.hint}</p>
                    {score !== null && score <= 4 ? (
                      <Link to="/chat" className="mood-selected__link">
                        Talk it through with {companionName}
                        <ArrowRightIcon size={13} />
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="mood-selected mood-selected--empty">
                  Choose a face to see a gentle reflection.
                </p>
              )}

              <Field
                label="Anything you want to remember about today?"
                htmlFor="mood-note"
                optional
                hint={`${note.length}/${NOTE_LIMIT} characters · only you can see this`}
              >
                <Textarea
                  id="mood-note"
                  value={note}
                  maxLength={NOTE_LIMIT}
                  rows={3}
                  placeholder="A sentence, a feeling, or nothing at all…"
                  onChange={(event) => {
                    setNote(event.target.value);
                    setHasEdited(true);
                    setSavedMessage("");
                  }}
                />
              </Field>

              {saveError ? <Alert tone="danger">{saveError}</Alert> : null}
              {savedMessage ? (
                <Alert tone="success">
                  <CheckIcon size={16} /> {savedMessage}
                </Alert>
              ) : null}
              {savedMessage ? (
                <DemoNote tone="success">
                  Demo mode: this check-in lives in this browser session only —
                  nothing was written to Mindora’s mood log.
                </DemoNote>
              ) : null}

              <div className="mood-actions">
                <Button
                  onClick={() => void handleSave()}
                  loading={saving}
                  disabled={score === null || !changed}
                  leftIcon={<MoodIcon size={17} />}
                >
                  {today ? "Update today’s check-in" : "Save today’s check-in"}
                </Button>
                {today && !changed ? (
                  <span className="mood-actions__note">
                    Last updated{" "}
                    {parseUtcDate(today.updated_at).toLocaleTimeString(
                      undefined,
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                ) : (
                  <span className="mood-actions__note">
                    Saving again today replaces today’s entry.
                  </span>
                )}
              </div>

              {today?.note && !hasEdited ? (
                <blockquote className="mood-note-preview">
                  <span>Your note today</span>
                  <p>{today.note}</p>
                </blockquote>
              ) : null}
            </>
          )}
        </Card>

        <Card className="mood-patterns">
          <CardHeader
            eyebrow="Your patterns"
            title="How the month is sitting"
            subtitle="Only the days you checked in are counted."
          />
          {loading ? (
            <div className="skeleton-stack">
              <Skeleton width="100%" height={72} radius={18} />
              <Skeleton width="100%" height={72} radius={18} />
            </div>
          ) : summary ? (
            <>
              <div className="mood-stats">
                <StatTile
                  label="Current streak"
                  value={`${summary.trends.current_streak} day${
                    summary.trends.current_streak === 1 ? "" : "s"
                  }`}
                  hint="Consecutive check-ins"
                />
                <StatTile
                  label="7-day average"
                  value={summary.trends.current_7_day_average ?? "—"}
                  hint="Out of 10"
                />
                <StatTile
                  label="Days missed"
                  value={summary.trends.missing_days_last_7_days}
                  hint="In the last 7 days"
                />
                <StatTile
                  label="Total check-ins"
                  value={summary.statistics.total_check_ins}
                  hint="Last 30 days"
                />
              </div>

              <div className="mood-range">
                <div>
                  <span>Highest</span>
                  <strong>{summary.statistics.highest_mood ?? "—"}</strong>
                </div>
                <div>
                  <span>Average</span>
                  <strong>{summary.statistics.average_mood ?? "—"}</strong>
                </div>
                <div>
                  <span>Lowest</span>
                  <strong>{summary.statistics.lowest_mood ?? "—"}</strong>
                </div>
              </div>

              {summary.trends.weekly_change !== null ? (
                <p className="mood-patterns__change">
                  Compared with the previous week, your average has{" "}
                  <strong>
                    {summary.trends.weekly_change > 0
                      ? `risen by ${summary.trends.weekly_change}`
                      : summary.trends.weekly_change < 0
                        ? `eased by ${Math.abs(summary.trends.weekly_change)}`
                        : "stayed the same"}
                  </strong>
                  .
                </p>
              ) : (
                <p className="mood-patterns__change">
                  A comparison appears once there are enough check-ins across
                  two weeks.
                </p>
              )}
            </>
          ) : (
            <p className="muted">
              Your pattern summary is unavailable right now. Your check-ins are
              still safe in your account.
            </p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          eyebrow="Last 30 days"
          title="Your mood, day by day"
          subtitle={
            isDemoActive()
              ? "Sample check-in dates for the demo — gaps are intentional."
              : "The chart plots only real check-in dates — gaps stay gaps."
          }
          action={<Badge tone="neutral">{moods.length} check-ins</Badge>}
        />
        {loading ? (
          <Skeleton width="100%" height={230} radius={20} />
        ) : (
          <MoodChart data={moods} height={240} />
        )}
      </Card>

      <Card>
        <CardHeader
          eyebrow="Recent"
          title="Check-in history"
          subtitle="Notes are only shown for today’s entry; older notes stay stored but aren’t returned by the summary endpoint."
          action={<Badge tone="neutral">{recent.length} shown</Badge>}
        />
        <div className="mood-history__toolbar">
          <div
            className="mood-history__filters"
            role="group"
            aria-label="Filter check-in history"
          >
            {(
              [
                { days: 7, label: "7 days" },
                { days: 14, label: "14 days" },
                { days: 30, label: "30 days" },
              ] as const
            ).map((option) => (
              <button
                key={option.days}
                type="button"
                className={classNames(
                  "chip",
                  historyRange === option.days && "chip--active",
                )}
                aria-pressed={historyRange === option.days}
                onClick={() => setHistoryRange(option.days)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Link to="/chat" className="text-button">
            Open companion
          </Link>
        </div>
        {loading ? (
          <div className="skeleton-stack">
            <Skeleton width="100%" height={48} radius={14} />
            <Skeleton width="100%" height={48} radius={14} />
            <Skeleton width="100%" height={48} radius={14} />
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<MoodIcon size={22} />}
            title={
              moods.length === 0
                ? "No check-ins yet"
                : `No check-ins in the last ${historyRange} days`
            }
            description={
              moods.length === 0
                ? "The first dot on the chart starts with one honest feeling."
                : "Your older entries are still safe — try a wider window."
            }
            action={
              moods.length === 0 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    document
                      .querySelector<HTMLInputElement>(
                        "input[name='mood-band']",
                      )
                      ?.focus()
                  }
                >
                  Pick a face
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setHistoryRange(30)}
                >
                  Show 30 days
                </Button>
              )
            }
          />
        ) : (
          <ul className="mood-history">
            {recent.map((entry) => {
              const tone = describeMood(entry.score);
              return (
                <li key={entry.date} className="mood-history__row">
                  <span className="mood-history__date">
                    {formatDate(entry.date)}
                  </span>
                  <span
                    className={classNames(
                      "mood-history__score",
                      `mood-history__score--${tone.tone}`,
                    )}
                  >
                    {entry.score}
                    <span>/10</span>
                  </span>
                  <span className="mood-history__label">
                    <MoodFace tone={tone.tone} size={22} />
                    {tone.label}
                  </span>
                  <span className="mood-history__day">
                    {formatShortDate(entry.date)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <aside className="support-note">
        <SparkIcon size={18} />
        <p>
          A low score is information, not a failure. If today feels unsafe or
          unmanageable, please reach out to someone you trust, a local
          emergency service, or a qualified professional.{" "}
          <Link to="/professionals" className="text-button">
            Find a professional <ArrowRightIcon size={14} />
          </Link>
        </p>
      </aside>
    </div>
  );
}
