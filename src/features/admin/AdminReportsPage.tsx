import { useCallback, useEffect, useState } from "react";
import { fetchOperationsReport } from "@/api/admin";
import { describeApiError } from "@/lib/errors";
import { formatDate } from "@/lib/date";
import { classNames } from "@/lib/utils";
import type { AdminReportSummary } from "@/types";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import { AdminStat, Breakdown, DailyBars } from "./AdminShared";
import { DemoNote } from "@/components/demo/DemoNote";

const PERIODS = [7, 30, 90] as const;

function formatRate(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value * 1000) / 10}%`;
}

function prettyLabel(value: string) {
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function AdminReportsPage() {
  const [days, setDays] = useState<(typeof PERIODS)[number]>(30);
  const [data, setData] = useState<AdminReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (windowDays: number) => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchOperationsReport(windowDays));
    } catch (loadError) {
      setError(
        describeApiError(
          loadError,
          "We couldn’t load the operations report.",
        ).message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const report = await fetchOperationsReport(days);
        if (!cancelled) setData(report);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            describeApiError(
              loadError,
              "We couldn’t load the operations report.",
            ).message,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const assessmentTypes = data
    ? Object.entries(data.assessments.by_type)
    : [];

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow="Administration"
        title="Operations report"
        description="Aggregate activity for a bounded window. The server returns counts only — never names, answers, scores, mood notes or notification contents."
        actions={
          <Button variant="secondary" onClick={() => void load(days)} loading={loading}>
            Refresh
          </Button>
        }
      />

      <DemoNote>
        Demo mode: this report is generated from synthetic sample data held in
        your browser, not from Mindora’s database.
      </DemoNote>

      <Card className="admin-filter-bar">
        <div
          className="appointment-filters__statuses"
          role="group"
          aria-label="Report period"
        >
          {PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              className={classNames("chip", days === period && "chip--active")}
              aria-pressed={days === period}
              onClick={() => setDays(period)}
              disabled={loading}
            >
              Last {period} days
            </button>
          ))}
        </div>
        {data ? (
          <p className="admin-period">
            {formatDate(data.period.start)} — {formatDate(data.period.end)}
            <span>
              {data.period.days} day{data.period.days === 1 ? "" : "s"} requested
            </span>
          </p>
        ) : null}
      </Card>

      {error ? (
        <div className="alert alert--danger" role="alert">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void load(days)}>
            Try again
          </Button>
        </div>
      ) : null}

      {loading || !data ? (
        <>
          <div className="admin-stat-grid">
            {[0, 1, 2, 3, 4].map((key) => (
              <Skeleton key={key} width="100%" height={118} radius={24} />
            ))}
          </div>
          <div className="admin-breakdown-grid">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} width="100%" height={240} radius={24} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="admin-stat-grid">
            <AdminStat
              label="New signups"
              value={data.user_signups.total}
              hint={`${data.user_signups.daily.length} day series`}
              tone="lavender"
            />
            <AdminStat
              label="Appointments booked"
              value={data.appointments.booked}
              hint={`${data.appointments.by_status.confirmed ?? 0} confirmed · ${
                data.appointments.by_status.pending ?? 0
              } pending`}
              tone="peach"
            />
            <AdminStat
              label="Assessment completion"
              value={formatRate(data.assessments.completion_rate)}
              hint={`${data.assessments.completed} completed of ${data.assessments.started} started`}
              tone="brand"
            />
            <AdminStat
              label="Mood check-ins"
              value={data.mood_checkins.total}
              hint="Volume only — no scores or notes"
              tone="mist"
            />
            <AdminStat
              label="Notifications read"
              value={formatRate(data.notifications.read_rate)}
              hint={`${data.notifications.read} of ${data.notifications.sent} sent`}
              tone="sage"
            />
          </div>

          <div className="admin-daily-grid">
            <DailyBars
              title="New signups"
              subtitle="Accounts created per day."
              data={data.user_signups.daily}
            />
            <DailyBars
              title="Appointments booked"
              subtitle="Bookings per day, regardless of later status."
              data={data.appointments.daily}
            />
            <DailyBars
              title="Assessments started"
              subtitle="Assessment sessions opened per day."
              data={data.assessments.daily}
            />
            <DailyBars
              title="Mood check-ins"
              subtitle="Check-ins recorded per day."
              data={data.mood_checkins.daily}
            />
          </div>

          <div className="admin-breakdown-grid">
            <Breakdown
              title="Appointments by status"
              subtitle="Bookings created during this window."
              values={data.appointments.by_status}
            />
            <Breakdown
              title="Appointments by type"
              subtitle="Bookings created during this window."
              values={data.appointments.by_type}
            />
            <Card className="admin-breakdown">
              <CardHeader
                title="Assessments by type"
                subtitle="Started versus completed."
              />
              {assessmentTypes.length === 0 ? (
                <p className="muted">No assessments in this period.</p>
              ) : (
                <ul className="breakdown-list report-type-list">
                  {assessmentTypes.map(([type, counts]) => {
                    const percent =
                      counts.started > 0
                        ? Math.round((counts.completed / counts.started) * 100)
                        : 0;
                    return (
                      <li key={type}>
                        <div className="breakdown-list__row">
                          <span>{prettyLabel(type)}</span>
                          <strong>
                            {counts.completed}/{counts.started}
                          </strong>
                        </div>
                        <div className="breakdown-list__bar" aria-hidden="true">
                          <span style={{ width: `${percent}%` }} />
                        </div>
                        <small className="report-type-list__hint">
                          {counts.started} started · {counts.completed} completed ·{" "}
                          {percent}% completion
                        </small>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          <Card className="admin-report-notifications">
            <CardHeader
              eyebrow="Delivery"
              title="Notifications"
              subtitle="Aggregate delivery counters for the window."
            />
            <div className="admin-report-notifications__stats">
              <div>
                <span>Sent</span>
                <strong>{data.notifications.sent}</strong>
              </div>
              <div>
                <span>Read</span>
                <strong>{data.notifications.read}</strong>
              </div>
              <div>
                <span>Unread</span>
                <strong>{data.notifications.unread}</strong>
              </div>
              <div>
                <span>Read rate</span>
                <strong>{formatRate(data.notifications.read_rate)}</strong>
              </div>
            </div>
            <div
              className="progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(data.notifications.read_rate * 100)}
              aria-label="Notification read rate"
            >
              <span
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, data.notifications.read_rate * 100),
                  )}%`,
                }}
              />
            </div>
          </Card>

          <Alert tone="info">
            This report is read-only and deliberately limited. It does not
            expose assessment answers, scores or severity, mood values or notes,
            notification titles or contents, or any per-person activity. The
            backend clamps the window to 1–90 days; no export endpoint exists,
            so the page offers no download.
          </Alert>
        </>
      )}
    </div>
  );
}
