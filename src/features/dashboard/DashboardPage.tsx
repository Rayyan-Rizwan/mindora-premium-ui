import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchMoodSummary,
  fetchTodayMood,
  saveMood,
} from "@/api/mood";
import { fetchMyAppointments } from "@/api/appointments";
import { useAuth } from "@/hooks/useAuth";
import { formatDateTime, formatShortDate, localDayString } from "@/lib/date";
import { describeApiError } from "@/lib/errors";
import {
  bandForScore,
  describeMood,
  MOOD_BANDS,
  type MoodBand,
  type MoodTone,
} from "@/lib/mood";
import { classNames, firstName } from "@/lib/utils";
import { isDemoActive } from "@/demo/demoSession";
import type { Appointment, MoodRecord, MoodSummary } from "@/types";
import { CompanionAvatar } from "@/components/avatar/CompanionAvatar";
import { Avatar, Skeleton } from "@/components/ui";
import { MoodFace } from "@/components/ui/MoodFace";
import {
  ArrowRightIcon,
  BookIcon,
  CalendarIcon,
  ChartIcon,
  ChatIcon,
  CheckIcon,
  ChevronIcon,
  LeafIcon,
  MoodIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Logo } from "@/components/layout/Logo";
import { DemoNote } from "@/components/demo/DemoNote";

interface DashboardData {
  todayMood: MoodRecord | null;
  moodSummary: MoodSummary | null;
  appointments: Appointment[];
}

const EMPTY: DashboardData = {
  todayMood: null,
  moodSummary: null,
  appointments: [],
};

/* The reference uses friendlier words for the same stored 1–10 bands. */
const DASH_MOOD_LABELS: Record<MoodTone, string> = {
  "very-low": "Very Sad",
  low: "Sad",
  okay: "Okay",
  good: "Good",
  great: "Great",
};

/* Warm pastel face palette from the reference; the stored scores and the
   shared mood tokens used elsewhere stay untouched. */
const DASH_FACE_COLORS: Record<MoodTone, string> = {
  "very-low": "#b7a4ee",
  low: "#f1ac9c",
  okay: "#f0d28c",
  good: "#9bd5cc",
  great: "#a6d7a3",
};

const FEATURES = [
  {
    to: "/chat",
    title: "AI Chat",
    hint: "Talk to your companion",
    icon: ChatIcon,
    tone: "brand",
  },
  {
    to: "/mood",
    title: "Mood",
    hint: "Check-in & journal",
    icon: MoodIcon,
    tone: "brand-2",
  },
  {
    to: "/assessment",
    title: "Assessment",
    hint: "Know yourself better",
    icon: BookIcon,
    tone: "brand-deep",
  },
  {
    to: "/relax",
    title: "Relax & Listen",
    hint: "Breathing, meditation, music",
    icon: LeafIcon,
    tone: "success",
  },
  {
    to: "/professionals",
    title: "Professionals",
    hint: "Book a session",
    icon: UsersIcon,
    tone: "danger",
  },
  {
    to: "/mood",
    title: "Insights",
    hint: "Track your progress",
    icon: ChartIcon,
    tone: "warning",
  },
] as const;

type ToastState = { tone: "success" | "error"; text: string } | null;

function dayLabel(date: string): string {
  if (date === localDayString()) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date === localDayString(yesterday)) return "Yesterday";
  return formatShortDate(date);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingTone, setPendingTone] = useState<MoodTone | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [today, summary, appointments] = await Promise.allSettled([
      fetchTodayMood(),
      fetchMoodSummary(),
      fetchMyAppointments(),
    ]);

    setData({
      todayMood: today.status === "fulfilled" ? today.value : null,
      moodSummary: summary.status === "fulfilled" ? summary.value : null,
      appointments:
        appointments.status === "fulfilled" ? appointments.value : [],
    });

    if (
      today.status === "rejected" &&
      summary.status === "rejected" &&
      appointments.status === "rejected"
    ) {
      setError(
        "We couldn’t reach your account data. Check your connection and try again.",
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const displayName = firstName(user?.full_name) || "there";
  const todayMood = data.todayMood;
  const selectedTone = todayMood
    ? bandForScore(todayMood.mood_score).tone
    : null;

  const latestEntry = useMemo(() => {
    if (todayMood) {
      return {
        date: todayMood.mood_date,
        score: todayMood.mood_score,
      };
    }
    const moods = data.moodSummary?.moods ?? [];
    const latest = moods[moods.length - 1];
    return latest ? { date: latest.date, score: latest.score } : null;
  }, [todayMood, data.moodSummary]);

  const latestDescriptor = latestEntry
    ? describeMood(latestEntry.score)
    : null;

  const upcoming = useMemo(() => {
    const now = Date.now();
    return data.appointments
      .filter(
        (appointment) =>
          appointment.status !== "cancelled" &&
          appointment.status !== "completed" &&
          new Date(
            appointment.scheduled_at.endsWith("Z")
              ? appointment.scheduled_at
              : `${appointment.scheduled_at}Z`,
          ).getTime() >= now,
      )
      .sort(
        (a, b) =>
          new Date(`${a.scheduled_at}Z`).getTime() -
          new Date(`${b.scheduled_at}Z`).getTime(),
      )[0];
  }, [data.appointments]);

  const handleMoodSelect = async (band: MoodBand) => {
    if (pendingTone || band.tone === selectedTone) return;

    setPendingTone(band.tone);
    setToast(null);
    try {
      const record = await saveMood(
        band.anchor,
        todayMood?.note?.trim() ? todayMood.note : null,
      );
      setData((current) => ({ ...current, todayMood: record }));
      void fetchMoodSummary()
        .then((summary) =>
          setData((current) => ({ ...current, moodSummary: summary })),
        )
        .catch(() => undefined);
      setToast({
        tone: "success",
        text: isDemoActive()
          ? "Today’s check-in saved in this browser — demo only."
          : "Today’s check-in is saved. Thank you for checking in.",
      });
    } catch (saveError) {
      setToast({
        tone: "error",
        text: describeApiError(
          saveError,
          "We couldn’t save your check-in. Please try again.",
        ).message,
      });
    } finally {
      setPendingTone(null);
    }
  };

  return (
    <div className="dash">
      <header className="dash-header">
        <Logo to="/dashboard" />
        <div className="dash-header__actions">
          <NotificationBell />
          <Link
            to="/settings"
            className="dash-avatar"
            aria-label="Open profile and settings"
          >
            <Avatar name={user?.full_name || user?.email || "You"} size={32} />
          </Link>
        </div>
      </header>

      <div className="dash-greeting">
        <h1>
          Hello, {displayName}{" "}
          <span className="dash-wave" aria-hidden="true">
            👋
          </span>
        </h1>
        <p>Small steps, big changes. You’re doing great!</p>
      </div>

      {error ? (
        <div className="dash-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void load()}>
            Try again
          </button>
        </div>
      ) : null}

      {!loading && user && !user.profile ? (
        <Link to="/onboarding" className="dash-setup">
          <span className="dash-setup__copy">
            <strong>Finish setting up your space</strong>
            <span>Add your preferred name, timezone and optional phone.</span>
          </span>
          <ArrowRightIcon size={16} />
        </Link>
      ) : null}

      <section className="dash-hero" aria-labelledby="dash-mood-title">
        <div className="dash-scene" aria-hidden="true">
          <svg
            viewBox="0 0 180 220"
            preserveAspectRatio="xMidYMax meet"
            focusable="false"
          >
            <ellipse className="dash-cloud dash-cloud--a" cx="112" cy="88" rx="62" ry="40" />
            <ellipse className="dash-cloud dash-cloud--b" cx="150" cy="120" rx="42" ry="30" />
            <ellipse className="dash-cloud dash-cloud--c" cx="72" cy="122" rx="40" ry="26" />
            <ellipse className="dash-hill" cx="110" cy="196" rx="88" ry="36" />
            <ellipse className="dash-hill dash-hill--front" cx="118" cy="214" rx="76" ry="26" />
            <g className="dash-flower dash-flower--one">
              <path d="M146 176c-2-14-1-24 4-34" />
              <circle cx="151" cy="138" r="7" />
              <circle cx="143" cy="144" r="6" />
              <circle cx="159" cy="144" r="6" />
              <circle cx="150" cy="151" r="5.5" />
            </g>
            <g className="dash-flower dash-flower--two">
              <path d="M42 190c0-12 2-20 7-28" />
              <circle cx="52" cy="156" r="5.5" />
              <circle cx="45" cy="161" r="4.8" />
              <circle cx="59" cy="161" r="4.8" />
              <circle cx="52" cy="166" r="4.4" />
            </g>
            <g className="dash-spark dash-spark--one">
              <path d="M0 -7C1 -2.6 2.6 -1 7 0 2.6 1 1 2.6 0 7-1 2.6-2.6 1-7 0-2.6-1-1-2.6 0-7Z" />
            </g>
            <g className="dash-spark dash-spark--two">
              <path d="M0 -6C.9 -2.2 2.2 -.9 6 0 2.2 .9 .9 2.2 0 6-.9 2.2-2.2 .9-6 0-2.2-.9-.9-2.2 0-6Z" />
            </g>
            <g className="dash-spark dash-spark--three">
              <path d="M0 -4.5C.7 -1.7 1.7 -.7 4.5 0 1.7 .7 .7 1.7 0 4.5-.7 1.7-1.7 .7-4.5 0-1.7-.7-.7-1.7 0-4.5Z" />
            </g>
          </svg>
          <div className="dash-scene__companion">
            <CompanionAvatar state="encouraging" size="md" />
          </div>
        </div>

        <section className="dash-mood-card" aria-labelledby="dash-mood-title">
          <h2 id="dash-mood-title">How are you feeling today?</h2>

          {loading ? (
            <div className="dash-faces dash-faces--loading" aria-hidden="true">
              {MOOD_BANDS.map((band) => (
                <span key={band.tone} className="dash-face-sk">
                  <Skeleton width={42} height={42} radius={999} />
                  <Skeleton width={38} height={8} radius={999} />
                </span>
              ))}
            </div>
          ) : (
            <div
              className="dash-faces"
              role="radiogroup"
              aria-labelledby="dash-mood-title"
            >
              {MOOD_BANDS.map((band) => {
                const isSelected = selectedTone === band.tone;
                const isSaving = pendingTone === band.tone;
                return (
                  <label
                    key={band.tone}
                    className={classNames(
                      "dash-face",
                      isSelected && "dash-face--selected",
                      isSaving && "dash-face--saving",
                    )}
                    data-tone={band.tone}
                  >
                    <input
                      type="radio"
                      name="dashboard-mood"
                      value={band.anchor}
                      checked={isSelected}
                      disabled={pendingTone !== null}
                      onChange={() => void handleMoodSelect(band)}
                      aria-label={`${DASH_MOOD_LABELS[band.tone]}, ${band.description}.`}
                    />
                    <span className="dash-face__art">
                      <MoodFace
                        tone={band.tone}
                        size={46}
                        colors={DASH_FACE_COLORS}
                      />
                    </span>
                    <span className="dash-face__label">
                      {DASH_MOOD_LABELS[band.tone]}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <p className="sr-only" role="status" aria-live="polite">
            {pendingTone
              ? "Saving your check-in…"
              : selectedTone && latestDescriptor
                ? `Today’s check-in: feeling ${latestDescriptor.label.toLowerCase()}.`
                : "No check-in yet today."}
          </p>
        </section>
      </section>

      <nav className="dash-features" aria-label="Quick actions">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={`${feature.to}-${feature.title}`}
              to={feature.to}
              className="dash-feature"
              data-tone={feature.tone}
            >
              <span className="dash-feature__icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="dash-feature__text">
                <strong>{feature.title}</strong>
                <span>{feature.hint}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <section className="dash-activity" aria-labelledby="dash-activity-title">
        <div className="dash-section-head">
          <h2 id="dash-activity-title">Your recent activity</h2>
          <Link to="/mood" className="dash-viewall">
            View all
          </Link>
        </div>

        <div className="dash-activity__panel">
          {loading ? (
            <div className="dash-activity__row dash-activity__row--loading">
              <Skeleton width={42} height={42} radius={999} />
              <span className="dash-activity__text">
                <Skeleton width="52%" height={12} />
                <Skeleton width="68%" height={9} />
              </span>
            </div>
          ) : latestEntry && latestDescriptor ? (
            <Link to="/mood" className="dash-activity__row">
              <span className="dash-activity__face" aria-hidden="true">
                <MoodFace
                  tone={latestDescriptor.tone}
                  size={40}
                  colors={DASH_FACE_COLORS}
                />
              </span>
              <span className="dash-activity__text">
                <strong>Mood Check-in</strong>
                <span>
                  {dayLabel(latestEntry.date)} · Feeling{" "}
                  {DASH_MOOD_LABELS[latestDescriptor.tone]}
                </span>
              </span>
              <ChevronIcon size={16} className="dash-activity__chev" />
            </Link>
          ) : (
            <div className="dash-activity__empty">
              <p>No check-ins yet — your first mood will appear here.</p>
              <Link to="/mood" className="dash-activity__cta">
                Check in now <ArrowRightIcon size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {!loading && upcoming ? (
        <Link
          to={`/appointments?focus=${upcoming.id}`}
          className="dash-visit"
        >
          <span className="dash-visit__icon" aria-hidden="true">
            <CalendarIcon size={18} />
          </span>
          <span className="dash-visit__body">
            <span className="dash-visit__eyebrow">Next appointment</span>
            <strong>{formatDateTime(upcoming.scheduled_at)}</strong>
            <span>
              {upcoming.professional_name || "Professional"}
              {upcoming.specialization ? ` · ${upcoming.specialization}` : ""}
            </span>
          </span>
          <ChevronIcon size={16} className="dash-visit__chev" />
        </Link>
      ) : null}

      <DemoNote>
        Demo mode · the name, moods and visits on this page are synthetic sample
        data. Nothing here belongs to a real account.
      </DemoNote>

      {toast ? (
        <div
          className={classNames(
            "dash-toast",
            toast.tone === "error" ? "dash-toast--error" : "dash-toast--success",
          )}
          role="status"
        >
          {toast.tone === "success" ? <CheckIcon size={16} /> : null}
          <span>{toast.text}</span>
        </div>
      ) : null}
    </div>
  );
}
