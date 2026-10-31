import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelAppointment,
  confirmAppointment,
  fetchAllAppointments,
  setAppointmentMeetingLink,
} from "@/api/appointments";
import { describeApiError } from "@/lib/errors";
import { formatDateTime } from "@/lib/date";
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
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
} from "@/components/ui";
import { CalendarIcon, SearchIcon } from "@/components/ui/icons";
import { AdminStat } from "./AdminShared";
import { DemoNote } from "@/components/demo/DemoNote";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_TONE: Record<
  AppointmentStatus,
  "warning" | "success" | "danger" | "info"
> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "danger",
  completed: "info",
};

const TYPE_LABEL: Record<AppointmentType, string> = {
  chat: "Text chat",
  audio: "Audio call",
  video: "Video call",
};

type StatusFilter = "all" | AppointmentStatus;
type PendingAction = "confirm" | "cancel";
type ModalState =
  | { kind: "status"; appointment: Appointment; action: PendingAction }
  | { kind: "link"; appointment: Appointment }
  | null;

function validateMeetUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Paste the Google Meet link for this session.";
  if (trimmed.length > 500) {
    return "The meeting link must be 500 characters or fewer.";
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "Enter a complete URL, for example https://meet.google.com/abc-defg-hij.";
  }
  if (parsed.protocol !== "https:" || parsed.host.toLowerCase() !== "meet.google.com") {
    return "Only links on https://meet.google.com are accepted.";
  }
  return "";
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | AppointmentType>("all");

  const [modal, setModal] = useState<ModalState>(null);
  const [working, setWorking] = useState(false);
  const [modalError, setModalError] = useState("");

  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAppointments(await fetchAllAppointments());
    } catch (loadError) {
      setError(
        describeApiError(
          loadError,
          "We couldn’t load the appointment records.",
        ).message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = {
      all: appointments.length,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    };
    for (const appointment of appointments) {
      base[appointment.status] += 1;
    }
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
        appointment.patient_name ?? "",
        appointment.professional_name ?? "",
        appointment.specialization ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [appointments, query, statusFilter, typeFilter]);

  const openStatusModal = (appointment: Appointment, action: PendingAction) => {
    setModal({ kind: "status", appointment, action });
    setModalError("");
  };

  const openLinkModal = (appointment: Appointment) => {
    setModal({ kind: "link", appointment });
    setLinkUrl(appointment.meeting_url ?? "");
    setLinkError("");
    setModalError("");
  };

  const closeModal = () => {
    if (working) return;
    setModal(null);
    setModalError("");
    setLinkError("");
  };

  const runStatusAction = async () => {
    if (!modal || modal.kind !== "status" || working) return;
    setWorking(true);
    setModalError("");
    setNotice("");
    try {
      const updated =
        modal.action === "confirm"
          ? await confirmAppointment(modal.appointment.id)
          : await cancelAppointment(modal.appointment.id);
      setAppointments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(
        modal.action === "confirm"
          ? "Appointment confirmed. The patient has been notified."
          : "Appointment cancelled. The other party has been notified where the backend supports it.",
      );
      setModal(null);
    } catch (failure) {
      setModalError(
        describeApiError(
          failure,
          `We couldn’t ${
            modal.action === "confirm" ? "confirm" : "cancel"
          } this appointment.`,
        ).message,
      );
    } finally {
      setWorking(false);
    }
  };

  const runLinkSave = async () => {
    if (!modal || modal.kind !== "link" || working) return;
    const validation = validateMeetUrl(linkUrl);
    setLinkError(validation);
    if (validation) return;

    setWorking(true);
    setModalError("");
    setNotice("");
    try {
      const updated = await setAppointmentMeetingLink(
        modal.appointment.id,
        linkUrl.trim(),
      );
      setAppointments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(
        updated.meeting_url
          ? "Meeting link saved. It is now visible to both parties because the appointment is confirmed."
          : "Meeting link saved. It will be shown once the appointment is confirmed.",
      );
      setModal(null);
    } catch (failure) {
      setModalError(
        describeApiError(
          failure,
          "The meeting link was rejected. Check the URL and try again.",
        ).message,
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow="Administration"
        title="Appointments"
        description="Every appointment on record. Administrators can confirm pending requests, cancel sessions and manage the Google Meet link. Links are only visible after confirmation."
        actions={
          <Button variant="secondary" onClick={() => void load()} loading={loading}>
            Refresh
          </Button>
        }
      />

      <DemoNote>
        Demo mode: these appointments are sample records. Confirming,
        cancelling or adding a link changes this browser session only.
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

      <div className="admin-stat-grid admin-stat-grid--compact">
        <AdminStat label="All appointments" value={counts.all} tone="lavender" />
        <AdminStat label="Pending" value={counts.pending} tone="peach" />
        <AdminStat label="Confirmed" value={counts.confirmed} tone="sage" />
        <AdminStat
          label="Closed"
          value={counts.cancelled + counts.completed}
          hint={`${counts.cancelled} cancelled · ${counts.completed} completed`}
          tone="mist"
        />
      </div>

      <Card className="admin-filter-bar">
        <div className="directory-toolbar__search">
          <SearchIcon size={17} />
          <label className="sr-only" htmlFor="admin-appointment-search">
            Search appointments
          </label>
          <Input
            id="admin-appointment-search"
            value={query}
            placeholder="Search patient, professional or specialization"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <label className="admin-filter-bar__select">
          <span>Type</span>
          <Select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as typeof typeFilter)
            }
          >
            <option value="all">All types</option>
            <option value="chat">Text chat</option>
            <option value="audio">Audio call</option>
            <option value="video">Video call</option>
          </Select>
        </label>
        <div
          className="appointment-filters__statuses"
          role="group"
          aria-label="Filter by status"
        >
          {(["all", "pending", "confirmed", "cancelled", "completed"] as const).map(
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
        <Card className="admin-table-card">
          <div className="skeleton-stack">
            {[0, 1, 2, 3, 4].map((key) => (
              <Skeleton key={key} width="100%" height={44} radius={12} />
            ))}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarIcon size={24} />}
            title={
              appointments.length === 0
                ? "No appointments yet"
                : "No appointments match these filters"
            }
            description={
              appointments.length === 0
                ? "When a patient requests a session, it will appear here."
                : "Try another search or clear the status and type filters."
            }
            action={
              appointments.length > 0 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card className="admin-table-card">
          <div className="table-wrap">
            <table className="admin-table admin-appointment-table">
              <caption className="sr-only">
                All appointments with administrative actions
              </caption>
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Patient</th>
                  <th scope="col">Professional</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col">Meeting link</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appointment) => {
                  const canConfirm = appointment.status === "pending";
                  const canCancel =
                    appointment.status === "pending" ||
                    appointment.status === "confirmed";
                  const linkVisible = Boolean(appointment.meeting_url);

                  return (
                    <tr key={appointment.id}>
                      <td data-label="When">
                        <div className="admin-cell-stack">
                          <strong>{formatDateTime(appointment.scheduled_at)}</strong>
                          <span>{appointment.duration_minutes} minutes</span>
                          <span>
                            Requested {formatDateTime(appointment.created_at)}
                          </span>
                        </div>
                      </td>
                      <td data-label="Patient">
                        {appointment.patient_name || "Patient"}
                      </td>
                      <td data-label="Professional">
                        <div className="admin-cell-stack">
                          <strong>
                            {appointment.professional_name || "Professional"}
                          </strong>
                          <span>{appointment.specialization || "—"}</span>
                        </div>
                      </td>
                      <td data-label="Type">
                        {TYPE_LABEL[appointment.appointment_type]}
                      </td>
                      <td data-label="Status">
                        <Badge tone={STATUS_TONE[appointment.status]} dot>
                          {STATUS_LABEL[appointment.status]}
                        </Badge>
                      </td>
                      <td data-label="Meeting link">
                        {linkVisible && appointment.meeting_url ? (
                          <a
                            href={appointment.meeting_url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="admin-link"
                          >
                            Open Meet link
                          </a>
                        ) : (
                          <span className="admin-cell-muted">
                            {appointment.status === "confirmed"
                              ? "Not added"
                              : "Visible after confirmation"}
                          </span>
                        )}
                      </td>
                      <td data-label="Actions">
                        <div className="admin-row-actions">
                          {canConfirm ? (
                            <button
                              type="button"
                              className="admin-action"
                              onClick={() =>
                                openStatusModal(appointment, "confirm")
                              }
                            >
                              Confirm
                            </button>
                          ) : null}
                          {canCancel ? (
                            <button
                              type="button"
                              className="admin-action admin-action--danger"
                              onClick={() =>
                                openStatusModal(appointment, "cancel")
                              }
                            >
                              Cancel
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="admin-action admin-action--role"
                            onClick={() => openLinkModal(appointment)}
                          >
                            {appointment.meeting_url ? "Replace link" : "Set link"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && appointments.length > 0 ? (
        <p className="page-note">
          Showing {filtered.length} of {appointments.length} appointments.
          Meeting links must be https:// URLs on the exact meet.google.com host;
          the server re-validates the link each time it is shown. Saving a link
          never sends a notification by itself.
        </p>
      ) : null}

      <Modal
        open={Boolean(modal)}
        onClose={closeModal}
        title={
          modal?.kind === "link"
            ? "Manage meeting link"
            : modal?.kind === "status" && modal.action === "confirm"
              ? "Confirm appointment"
              : "Cancel appointment"
        }
        size="md"
        footer={
          <div className="booking-footer">
            <Button variant="ghost" onClick={closeModal} disabled={working}>
              Go back
            </Button>
            {modal?.kind === "link" ? (
              <Button onClick={() => void runLinkSave()} loading={working}>
                Save link
              </Button>
            ) : (
              <Button
                variant={modal?.kind === "status" && modal.action === "cancel" ? "danger" : "primary"}
                onClick={() => void runStatusAction()}
                loading={working}
              >
                {modal?.kind === "status" && modal.action === "confirm"
                  ? "Confirm appointment"
                  : "Cancel appointment"}
              </Button>
            )}
          </div>
        }
      >
        {modal?.kind === "link" ? (
          <div className="stack">
            <p>
              <strong>{modal.appointment.patient_name || "Patient"}</strong>
              {" with "}
              <strong>
                {modal.appointment.professional_name || "Professional"}
              </strong>
              {" — "}
              {formatDateTime(modal.appointment.scheduled_at)}
            </p>
            <Field
              label="Google Meet link"
              htmlFor="admin-meeting-link"
              hint="Must start with https://meet.google.com. The API stores it regardless of status but only shows it after confirmation."
              error={linkError || undefined}
            >
              <Input
                id="admin-meeting-link"
                type="url"
                inputMode="url"
                value={linkUrl}
                placeholder="https://meet.google.com/abc-defg-hij"
                onChange={(event) => {
                  setLinkUrl(event.target.value);
                  if (linkError) setLinkError("");
                }}
                autoFocus
              />
            </Field>
            <p className="muted">
              {modal.appointment.status === "confirmed"
                ? "This appointment is confirmed, so both parties will see the link immediately after saving."
                : `This appointment is ${modal.appointment.status}. The link will stay hidden until it is confirmed.`}
            </p>
            {modalError ? <Alert tone="danger">{modalError}</Alert> : null}
          </div>
        ) : modal?.kind === "status" ? (
          <div className="stack">
            <p>
              {modal.action === "confirm"
                ? `Confirm the ${TYPE_LABEL[modal.appointment.appointment_type]} session with ${modal.appointment.patient_name || "this patient"}?`
                : `Cancel the ${TYPE_LABEL[modal.appointment.appointment_type]} session between ${modal.appointment.patient_name || "the patient"} and ${modal.appointment.professional_name || "the professional"}? This cannot be undone.`}
            </p>
            <p className="muted">
              {formatDateTime(modal.appointment.scheduled_at)} ·{" "}
              {modal.appointment.duration_minutes} minutes ·{" "}
              {STATUS_LABEL[modal.appointment.status]}
            </p>
            <p className="muted">
              The server sends the corresponding appointment notification in the
              same transaction. Cancelling an already closed appointment is a
              no-op.
            </p>
            {modalError ? <Alert tone="danger">{modalError}</Alert> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
