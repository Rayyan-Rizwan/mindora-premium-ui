import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchApplications,
  reviewApplication,
} from "@/api/appointments";
import { useAuth } from "@/hooks/useAuth";
import { describeApiError } from "@/lib/errors";
import { formatDate, formatDateTime } from "@/lib/date";
import { classNames } from "@/lib/utils";
import type {
  AppointmentType,
  ProfessionalApplication,
  ProfessionalApprovalStatus,
  WeeklySchedule,
} from "@/types";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import { SearchIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";
import { DemoNote } from "@/components/demo/DemoNote";

const TABS: ProfessionalApprovalStatus[] = [
  "pending",
  "approved",
  "rejected",
];

const TAB_LABEL: Record<ProfessionalApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const TYPE_LABEL: Record<AppointmentType, string> = {
  chat: "Text chat",
  audio: "Audio call",
  video: "Video call",
};

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

type ReviewAction = "approve" | "reject" | "deactivate" | "reactivate";

const ACTION_COPY: Record<
  ReviewAction,
  { title: string; body: string; notice: string; danger: boolean }
> = {
  approve: {
    title: "Approve application",
    body: "The applicant becomes a professional, their profile becomes visible in the verified directory, and they can receive appointment requests.",
    notice: "Application approved. The account is now a professional profile.",
    danger: false,
  },
  reject: {
    title: "Reject application",
    body: "The applicant stays a regular member and is not listed publicly. They may submit a new application later.",
    notice: "Application rejected. The applicant remains a member.",
    danger: true,
  },
  deactivate: {
    title: "Deactivate professional",
    body: "The professional will be blocked from signing in. Their profile, appointments and history are preserved.",
    notice: "Professional account deactivated.",
    danger: true,
  },
  reactivate: {
    title: "Reactivate professional",
    body: "The professional will be able to sign in and receive new appointment requests again.",
    notice: "Professional account reactivated.",
    danger: false,
  },
};

type StatusLists = Record<ProfessionalApprovalStatus, ProfessionalApplication[]>;

const EMPTY_LISTS: StatusLists = {
  pending: [],
  approved: [],
  rejected: [],
};

function sortByCreated(items: ProfessionalApplication[]) {
  return [...items].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
}

function availabilityRows(availability: WeeklySchedule | null) {
  if (!availability) return [];
  return DAY_ORDER.filter((day) => {
    const windows = availability[day];
    return Array.isArray(windows) && windows.length > 0;
  }).map((day) => ({
    day: `${day[0].toUpperCase()}${day.slice(1, 3)}`,
    windows: availability[day]
      .map((window) => `${window.start}–${window.end}`)
      .join(", "),
  }));
}

export default function AdminApplicationsPage() {
  const { user: me } = useAuth();
  const [lists, setLists] = useState<StatusLists>(EMPTY_LISTS);
  const [tab, setTab] = useState<ProfessionalApprovalStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");

  const [review, setReview] = useState<{
    application: ProfessionalApplication;
    action: ReviewAction;
  } | null>(null);
  const [working, setWorking] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled(
      TABS.map((status) => fetchApplications(status)),
    );

    const next: StatusLists = { ...EMPTY_LISTS };
    let failures = 0;
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        next[TABS[index]] = result.value;
      } else {
        failures += 1;
      }
    });

    setLists(next);
    if (failures === TABS.length) {
      const firstFailure = results.find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );
      setError(
        describeApiError(
          firstFailure?.reason,
          "We couldn’t load professional applications.",
        ).message,
      );
    } else if (failures > 0) {
      setError(
        "Some application lists couldn’t be loaded. Refresh to see every status.",
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return lists[tab];
    return lists[tab].filter((application) =>
      [
        application.applicant_name ?? "",
        application.applicant_email ?? "",
        application.specialization,
        application.license_number,
        application.qualification ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [lists, tab, query]);

  const openReview = (
    application: ProfessionalApplication,
    action: ReviewAction,
  ) => {
    setReview({ application, action });
    setReviewError("");
  };

  const closeReview = () => {
    if (working) return;
    setReview(null);
    setReviewError("");
  };

  const runReview = async () => {
    if (!review || working) return;
    setWorking(true);
    setReviewError("");
    setNotice("");

    try {
      const updated = await reviewApplication(
        review.application.id,
        review.action,
      );

      setLists((current) => {
        const next: StatusLists = {
          pending: current.pending.filter((item) => item.id !== updated.id),
          approved: current.approved.filter((item) => item.id !== updated.id),
          rejected: current.rejected.filter((item) => item.id !== updated.id),
        };
        next[updated.approval_status] = sortByCreated([
          ...next[updated.approval_status],
          updated,
        ]);
        return next;
      });

      setNotice(ACTION_COPY[review.action].notice);
      setReview(null);
    } catch (failure) {
      setReviewError(
        describeApiError(
          failure,
          "That change was rejected by the server. Refresh and review the application again.",
        ).message,
      );
    } finally {
      setWorking(false);
    }
  };

  const isSelf = (application: ProfessionalApplication) =>
    application.user_id === me?.id;

  const renderActions = (application: ProfessionalApplication) => {
    if (tab === "pending") {
      return (
        <div className="admin-row-actions">
          <Button
            size="sm"
            onClick={() => openReview(application, "approve")}
            disabled={isSelf(application)}
            title={
              isSelf(application)
                ? "You cannot review your own application"
                : undefined
            }
          >
            Approve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openReview(application, "reject")}
            disabled={isSelf(application)}
            title={
              isSelf(application)
                ? "You cannot review your own application"
                : undefined
            }
          >
            Reject
          </Button>
        </div>
      );
    }

    if (tab === "approved") {
      const deactivated = application.applicant_is_active === false;
      return (
        <div className="admin-row-actions">
          <Button
            variant={deactivated ? "secondary" : "ghost"}
            size="sm"
            onClick={() =>
              openReview(
                application,
                deactivated ? "reactivate" : "deactivate",
              )
            }
            disabled={isSelf(application)}
            title={
              isSelf(application)
                ? "You cannot deactivate your own account"
                : undefined
            }
          >
            {deactivated ? "Reactivate" : "Deactivate"}
          </Button>
        </div>
      );
    }

    return (
      <p className="application-card__closed">
        Only pending applications can be approved or rejected. The applicant may
        submit a new application from their own account.
      </p>
    );
  };

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow="Administration"
        title="Professional applications"
        description="Review licence details and availability before approving. Approval promotes the applicant to a professional and publishes their verified profile."
        actions={
          <Button variant="secondary" onClick={() => void load()} loading={loading}>
            Refresh
          </Button>
        }
      />

      <DemoNote>
        Demo mode: applications and review decisions are sample data. Approving
        or rejecting here changes this browser session only.
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

      <div className="admin-toolbar">
        <div
          className="admin-tabs"
          role="tablist"
          aria-label="Application status"
        >
          {TABS.map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              id={`applications-tab-${status}`}
              aria-selected={tab === status}
              aria-controls={`applications-panel-${status}`}
              className={classNames(
                "admin-tab",
                tab === status && "admin-tab--active",
              )}
              onClick={() => setTab(status)}
            >
              <span>{TAB_LABEL[status]}</span>
              <Badge tone={tab === status ? "brand" : "neutral"}>
                {lists[status].length}
              </Badge>
            </button>
          ))}
        </div>

        <div className="directory-toolbar__search">
          <SearchIcon size={17} />
          <label className="sr-only" htmlFor="admin-application-search">
            Search applications
          </label>
          <Input
            id="admin-application-search"
            value={query}
            placeholder="Search applicant, email, licence or specialization"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div
        id={`applications-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`applications-tab-${tab}`}
        className="stack"
      >
        {loading ? (
          [0, 1, 2].map((key) => (
            <Card
              key={key}
              className="application-card application-card--skeleton"
            >
              <div className="skeleton-stack">
                <Skeleton width="40%" height={20} />
                <Skeleton width="65%" height={14} />
                <Skeleton width="90%" height={60} radius={14} />
              </div>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<UsersIcon size={24} />}
              title={
                query.trim()
                  ? "No matching applications"
                  : `No ${TAB_LABEL[tab].toLowerCase()} applications`
              }
              description={
                query.trim()
                  ? "Try a different name, email, licence number or specialization."
                  : tab === "pending"
                    ? "New applications will appear here for review."
                    : `Applications appear here once their status is ${TAB_LABEL[tab].toLowerCase()}.`
              }
              action={
                query.trim() ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          filtered.map((application) => {
            const days = availabilityRows(application.availability);
            const types =
              application.consultation_types &&
              application.consultation_types.length > 0
                ? application.consultation_types
                : null;

            return (
              <Card key={application.id} className="application-card" as="article">
                <div className="application-card__head">
                  <div className="application-card__person">
                    <Avatar
                      name={
                        application.applicant_name ||
                        application.applicant_email ||
                        "Applicant"
                      }
                      size={48}
                    />
                    <div>
                      <h2>
                        {application.applicant_name || "Unnamed applicant"}
                      </h2>
                      <p>{application.applicant_email || "Email unavailable"}</p>
                    </div>
                  </div>
                  <div className="application-card__badges">
                    <Badge
                      tone={
                        application.approval_status === "approved"
                          ? "success"
                          : application.approval_status === "rejected"
                            ? "danger"
                            : "warning"
                      }
                      dot
                    >
                      {TAB_LABEL[application.approval_status]}
                    </Badge>
                    <Badge
                      tone={application.is_verified ? "success" : "neutral"}
                    >
                      {application.is_verified ? "Verified" : "Not verified"}
                    </Badge>
                    <Badge
                      tone={
                        application.applicant_is_active === false
                          ? "danger"
                          : "neutral"
                      }
                    >
                      {application.applicant_is_active === false
                        ? "Account inactive"
                        : "Account active"}
                    </Badge>
                  </div>
                </div>

                <dl className="application-card__meta">
                  <div>
                    <dt>Specialization</dt>
                    <dd>{application.specialization}</dd>
                  </div>
                  <div>
                    <dt>Licence</dt>
                    <dd>{application.license_number}</dd>
                  </div>
                  <div>
                    <dt>Qualification</dt>
                    <dd>{application.qualification || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt>Experience</dt>
                    <dd>
                      {application.years_experience} year
                      {application.years_experience === 1 ? "" : "s"}
                    </dd>
                  </div>
                  <div>
                    <dt>Consultation fee</dt>
                    <dd>{application.consultation_fee}</dd>
                  </div>
                  <div>
                    <dt>Applied</dt>
                    <dd>{formatDate(application.created_at)}</dd>
                  </div>
                  <div>
                    <dt>Last updated</dt>
                    <dd>
                      {application.updated_at
                        ? formatDateTime(application.updated_at)
                        : "—"}
                    </dd>
                  </div>
                </dl>

                <div className="application-card__body">
                  <h3>Biography</h3>
                  <p>
                    {application.bio ||
                      "No biography was provided with this application."}
                  </p>
                </div>

                <div className="application-card__columns">
                  <div>
                    <h3>Weekly availability</h3>
                    {days.length === 0 ? (
                      <p className="muted">No weekly schedule provided.</p>
                    ) : (
                      <ul className="application-availability">
                        {days.map((day) => (
                          <li key={day.day}>
                            <strong>{day.day}</strong>
                            <span>{day.windows}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3>Consultation types</h3>
                    {types ? (
                      <div className="professional-card__types">
                        {types.map((type) => (
                          <span key={type} className="professional-type">
                            {TYPE_LABEL[type] ?? type}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="muted">
                        No restriction — all appointment types are accepted.
                      </p>
                    )}
                    <p className="application-card__note">
                      <ShieldIcon size={14} /> Licence details are stored as
                      submitted. This interface does not verify them against a
                      registry.
                    </p>
                  </div>
                </div>

                <div className="application-card__footer">
                  {renderActions(application)}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <p className="page-note">
        Approving changes the applicant’s role to professional and makes their
        profile public. Deactivating only toggles the account flag; records are
        preserved. Every decision is enforced server-side.
      </p>

      <Modal
        open={Boolean(review)}
        onClose={closeReview}
        title={review ? ACTION_COPY[review.action].title : "Review application"}
        size="sm"
        footer={
          <div className="booking-footer">
            <Button variant="ghost" onClick={closeReview} disabled={working}>
              Go back
            </Button>
            <Button
              variant={
                review && ACTION_COPY[review.action].danger ? "danger" : "primary"
              }
              onClick={() => void runReview()}
              loading={working}
            >
              Confirm
            </Button>
          </div>
        }
      >
        {review ? (
          <div className="stack">
            <p>
              <strong>
                {review.application.applicant_name || "This applicant"}
              </strong>
              {" — "}
              {ACTION_COPY[review.action].body}
            </p>
            <p className="muted">
              {review.application.specialization} ·{" "}
              {review.application.license_number}
            </p>
            {reviewError ? <Alert tone="danger">{reviewError}</Alert> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
