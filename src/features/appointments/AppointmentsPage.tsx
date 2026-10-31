import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  cancelAppointment,
  confirmAppointment,
  fetchMyAppointments,
} from "@/api/appointments";
import { useAuth } from "@/hooks/useAuth";
import { describeApiError } from "@/lib/errors";
import { formatDateTime, parseUtcDate } from "@/lib/date";
import { classNames } from "@/lib/utils";
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from "@/types";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import {
  CalendarIcon,
  CheckIcon,
  SearchIcon,
  SparkIcon,
} from "@/components/ui/icons";
import { isDemoActive } from "@/demo/demoSession";
import { DemoNote } from "@/components/demo/DemoNote";

const STATUS_TONE: Record<
  AppointmentStatus,
  "neutral" | "warning" | "success" | "danger" | "info"
> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "danger",
  completed: "info",
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const TYPE_LABEL: Record<AppointmentType, string> = {
  chat: "Text chat",
  audio: "Audio call",
  video: "Video call",
};

type StatusFilter = "all" | AppointmentStatus;
type PendingAction = "cancel" | "confirm";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | AppointmentType>("all");
  const [query, setQuery] = useState("");

  const [actionTarget, setActionTarget] = useState<{
    appointment: Appointment;
    kind: PendingAction;
  } | null>(null);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const isProfessional = user?.role === "professional";
  const canConfirm = user?.role === "professional";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchMyAppointments();
      setAppointments(list);
    } catch (loadError) {
      setError(
        describeApiError(
          loadError,
          "We couldn’t load your appointments.",
        ).message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!focusId || loading) return;
    const node = document.getElementById(`appointment-${focusId}`);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusId, loading, appointments.length]);

  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = {
      all: appointments.length,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    };
    for (const appointment of appointments) base[appointment.status] += 1;
    return base;
  }, [appointments]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return appointments.filter((appointment) => {
      if (statusFilter !== "all" && appointment.status !== statusFilter) {
        return false;
      }
      if (
        typeFilter !== "all" &&
        appointment.appointment_type !== typeFilter
      ) {
        return false;
      }
      if (!needle) return true;
      return [
        appointment.professional_name ?? "",
        appointment.patient_name ?? "",
        appointment.specialization ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [appointments, statusFilter, typeFilter, query]);

  const now = Date.now();
  const upcoming = useMemo(
    () =>
      filtered
        .filter(
          (appointment) =>
            (appointment.status === "pending" ||
              appointment.status === "confirmed") &&
            parseUtcDate(appointment.scheduled_at).getTime() >= now,
        )
        .sort(
          (a, b) =>
            parseUtcDate(a.scheduled_at).getTime() -
            parseUtcDate(b.scheduled_at).getTime(),
        ),
    [filtered, now],
  );

  const history = useMemo(
    () =>
      filtered
        .filter(
          (appointment) =>
            appointment.status === "cancelled" ||
            appointment.status === "completed" ||
            parseUtcDate(appointment.scheduled_at).getTime() < now,
        )
        .sort(
          (a, b) =>
            parseUtcDate(b.scheduled_at).getTime() -
            parseUtcDate(a.scheduled_at).getTime(),
        ),
    [filtered, now],
  );

  const runAction = async () => {
    if (!actionTarget || acting) return;
    setActing(true);
    setActionError("");
    setNotice("");

    try {
      const updated =
        actionTarget.kind === "cancel"
          ? await cancelAppointment(actionTarget.appointment.id)
          : await confirmAppointment(actionTarget.appointment.id);
      setAppointments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(
        actionTarget.kind === "cancel"
          ? "The appointment has been cancelled."
          : "The appointment is confirmed. The patient can now see any meeting link added by an administrator.",
      );
      setActionTarget(null);
    } catch (actionFailure) {
      setActionError(
        describeApiError(
          actionFailure,
          `We couldn’t ${
            actionTarget.kind === "cancel" ? "cancel" : "confirm"
          } this appointment.`,
        ).message,
      );
    } finally {
      setActing(false);
    }
  };

  const renderCard = (appointment: Appointment, isHistory: boolean) => {
    const date = parseUtcDate(appointment.scheduled_at);
    const otherParty = isProfessional
      ? appointment.patient_name || "Patient"
      : appointment.professional_name || "Professional";
    const canCancel =
      !isHistory &&
      (appointment.status === "pending" || appointment.status === "confirmed");
    const showConfirm = canConfirm && appointment.status === "pending";

    return (
      <Card
        key={appointment.id}
        className={classNames(
          "appointment-card",
          focusId === appointment.id && "appointment-card--focus",
          isHistory && "appointment-card--history",
        )}
        as="article"
      >
        <div id={`appointment-${appointment.id}`} className="appointment-card__anchor" />
        <div className="appointment-card__date" aria-hidden="true">
          <span>
            {date.toLocaleDateString(undefined, { weekday: "short" })}
          </span>
          <strong>{date.getDate()}</strong>
          <span>
            {date.toLocaleDateString(undefined, { month: "short" })}
          </span>
        </div>

        <div className="appointment-card__body">
          <div className="appointment-card__head">
            <div>
              <h2>{otherParty}</h2>
              <p>
                {isProfessional ? "Patient" : appointment.specialization || "Care"}
                {" · "}
                {TYPE_LABEL[appointment.appointment_type]}
              </p>
            </div>
            <Badge tone={STATUS_TONE[appointment.status]} dot>
              {STATUS_LABEL[appointment.status]}
            </Badge>
          </div>

          <dl className="appointment-card__meta">
            <div>
              <dt>When</dt>
              <dd>{formatDateTime(appointment.scheduled_at)}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{appointment.duration_minutes} minutes</dd>
            </div>
            <div>
              <dt>Requested</dt>
              <dd>{formatDateTime(appointment.created_at)}</dd>
            </div>
          </dl>

          {appointment.meeting_url &&
          appointment.status === "confirmed" ? (
            <a
              href={appointment.meeting_url}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn--primary btn--sm appointment-card__join"
            >
              <CalendarIcon size={15} />
              <span>Join meeting</span>
            </a>
          ) : (
            <p className="appointment-card__meeting-note">
              {appointment.status === "confirmed"
                ? "Confirmed — a meeting link will appear here once an administrator adds one."
                : appointment.status === "pending"
                  ? "Waiting for confirmation. A meeting link becomes visible only after confirmation."
                  : "No meeting link for this appointment."}
            </p>
          )}

          {!isHistory ? (
            <div className="appointment-card__actions">
              {showConfirm ? (
                <Button
                  size="sm"
                  onClick={() =>
                    setActionTarget({ appointment, kind: "confirm" })
                  }
                  leftIcon={<CheckIcon size={15} />}
                >
                  Confirm
                </Button>
              ) : null}
              {canCancel ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setActionTarget({ appointment, kind: "cancel" })
                  }
                >
                  Cancel request
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>
    );
  };

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow="Care calendar"
        title="Appointments"
        description={
          isDemoActive()
            ? isProfessional
              ? "Sample requests assigned to this demo professional. No real patient is involved."
              : "Sample appointments for the demo. Booking, confirming and cancelling only change this browser session."
            : isProfessional
              ? "Requests assigned to you, with real patient names and the slots they booked."
              : "Your requested and confirmed sessions. Booking is a request until the professional confirms it."
        }
        actions={
          !isProfessional ? (
            <Link to="/professionals" className="btn btn--primary btn--md">
              <SparkIcon size={17} />
              <span>Find a professional</span>
            </Link>
          ) : undefined
        }
      />

      <DemoNote>
        Demo mode: appointment actions are simulated. Nothing is sent to
        Mindora or to a real professional.
      </DemoNote>

      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {error ? (
        <div className="alert alert--danger" role="alert">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : null}

      <Card className="appointment-filters">
        <div className="appointment-filters__top">
          <div className="directory-toolbar__search">
            <SearchIcon size={17} />
            <label className="sr-only" htmlFor="appointment-search">
              Search appointments
            </label>
            <Input
              id="appointment-search"
              value={query}
              placeholder={
                isProfessional
                  ? "Search by patient name"
                  : "Search by professional or specialization"
              }
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <label className="appointment-filters__type">
            <span>Type</span>
            <select
              className="select"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as typeof typeFilter)
              }
            >
              <option value="all">All types</option>
              <option value="chat">Text chat</option>
              <option value="audio">Audio call</option>
              <option value="video">Video call</option>
            </select>
          </label>
        </div>

        <div
          className="appointment-filters__statuses"
          role="group"
          aria-label="Filter by status"
        >
          {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map(
            (status) => (
              <button
                key={status}
                type="button"
                className={classNames(
                  "chip",
                  statusFilter === status && "chip--active",
                )}
                aria-pressed={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              >
                {status === "all" ? "All" : STATUS_LABEL[status]} ({counts[status]})
              </button>
            ),
          )}
        </div>
      </Card>

      {loading ? (
        <div className="stack">
          {[0, 1, 2].map((key) => (
            <Card key={key} className="appointment-card appointment-card--skeleton">
              <Skeleton width={72} height={86} radius={18} />
              <div className="skeleton-stack">
                <Skeleton width="45%" height={20} />
                <Skeleton width="70%" height={14} />
                <Skeleton width="55%" height={14} />
              </div>
            </Card>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarIcon size={24} />}
            title={isProfessional ? "No appointments assigned" : "No appointments yet"}
            description={
              isProfessional
                ? "When a patient books with you, the request will appear here."
                : "When you book with a professional, your pending and confirmed sessions will appear here."
            }
            action={
              !isProfessional ? (
                <Link to="/professionals" className="btn btn--primary btn--sm">
                  <span>Browse professionals</span>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <section className="stack" aria-labelledby="upcoming-heading">
            <div className="section-heading">
              <h2 id="upcoming-heading">
                <CalendarIcon size={18} /> Upcoming
              </h2>
              <Badge tone="neutral">{upcoming.length}</Badge>
            </div>
            {upcoming.length === 0 ? (
              <Card>
                <p className="muted">
                  No upcoming sessions match these filters.
                </p>
              </Card>
            ) : (
              upcoming.map((appointment) => renderCard(appointment, false))
            )}
          </section>

          {history.length > 0 ? (
            <section className="stack" aria-labelledby="history-heading">
              <div className="section-heading">
                <h2 id="history-heading">Past &amp; closed</h2>
                <Badge tone="neutral">{history.length}</Badge>
              </div>
              {history.map((appointment) => renderCard(appointment, true))}
            </section>
          ) : null}
        </>
      )}

      {!loading && appointments.length > 0 ? (
        <p className="page-note">
          Meeting links are created by administrators and only become visible
          after confirmation. Mindora does not send push notifications or
          process payments.
        </p>
      ) : null}

      <Modal
        open={Boolean(actionTarget)}
        onClose={() => {
          if (!acting) {
            setActionTarget(null);
            setActionError("");
          }
        }}
        title={
          actionTarget?.kind === "confirm"
            ? "Confirm appointment"
            : "Cancel appointment"
        }
        size="sm"
        footer={
          <div className="booking-footer">
            <Button
              variant="ghost"
              onClick={() => {
                setActionTarget(null);
                setActionError("");
              }}
              disabled={acting}
            >
              {actionTarget?.kind === "confirm" ? "Go back" : "Keep it"}
            </Button>
            <Button
              variant={actionTarget?.kind === "cancel" ? "danger" : "primary"}
              onClick={() => void runAction()}
              loading={acting}
            >
              {actionTarget?.kind === "confirm"
                ? "Confirm appointment"
                : "Cancel appointment"}
            </Button>
          </div>
        }
      >
        {actionTarget ? (
          <div className="stack">
            <p>
              {actionTarget.kind === "confirm"
                ? `Confirm the ${TYPE_LABEL[actionTarget.appointment.appointment_type]} session with ${actionTarget.appointment.patient_name || "this patient"}?`
                : `Cancel the ${TYPE_LABEL[actionTarget.appointment.appointment_type]} session with ${actionTarget.appointment.professional_name || "this professional"}? This cannot be undone.`}
            </p>
            <p className="muted">
              {formatDateTime(actionTarget.appointment.scheduled_at)} ·{" "}
              {actionTarget.appointment.duration_minutes} minutes
            </p>
            {actionError ? <Alert tone="danger">{actionError}</Alert> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
