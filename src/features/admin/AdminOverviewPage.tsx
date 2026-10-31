import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAnalytics } from "@/api/admin";
import { describeApiError } from "@/lib/errors";
import type { AdminAnalyticsSummary } from "@/types";
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChartIcon,
  MoodIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { AdminStat, Breakdown } from "./AdminShared";
import { isDemoActive } from "@/demo/demoSession";

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchAnalytics());
    } catch (loadError) {
      setError(
        describeApiError(
          loadError,
          "We couldn’t load platform analytics.",
        ).message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow="Administration"
        title="Operations overview"
        description={
          isDemoActive()
            ? "Synthetic sample figures for the demo. No real users, assessments or appointments are represented."
            : "Aggregate platform counts only. No names, answers, scores, mood notes or notification contents are returned here."
        }
        actions={
          <div className="page-header__action-row">
            <Button variant="ghost" size="md" onClick={() => void load()} loading={loading}>
              Refresh
            </Button>
            <Link to="/admin/reports" className="btn btn--primary btn--md">
              <ChartIcon size={17} />
              <span>Open reports</span>
            </Link>
          </div>
        }
      />

      {error ? (
        <div className="alert alert--danger" role="alert">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : null}

      {loading || !data ? (
        <div className="admin-stat-grid">
          {[0, 1, 2, 3, 4].map((key) => (
            <Skeleton key={key} width="100%" height={118} radius={24} />
          ))}
        </div>
      ) : (
        <>
          <div className="admin-stat-grid">
            <AdminStat
              label="Users"
              value={data.users.total}
              hint={`${data.users.active} active · ${data.users.inactive} inactive`}
              tone="lavender"
            />
            <AdminStat
              label="Professionals"
              value={data.professionals.total}
              hint={`${data.professionals.verified} verified · ${data.professionals.active} active`}
              tone="sage"
            />
            <AdminStat
              label="Appointments"
              value={data.appointments.total}
              hint={`${data.appointments.by_status.confirmed ?? 0} confirmed · ${
                data.appointments.by_status.pending ?? 0
              } pending`}
              tone="peach"
            />
            <AdminStat
              label="Assessments"
              value={data.assessments.completed}
              hint={`${data.assessments.total} started · ${data.assessments.in_progress} in progress`}
              tone="brand"
            />
            <AdminStat
              label="Mood check-ins"
              value={data.mood_records.total}
              hint="All recorded check-ins"
              tone="mist"
            />
          </div>

          <div className="admin-breakdown-grid">
            <Breakdown
              title="Users by role"
              subtitle="Existing accounts, including inactive ones."
              values={data.users.by_role}
            />
            <Breakdown
              title="Professional applications"
              subtitle="Approval status across all professional records."
              values={data.professionals.by_approval_status}
            />
            <Breakdown
              title="Appointments by status"
              subtitle="Every appointment on record."
              values={data.appointments.by_status}
            />
          </div>
        </>
      )}

      <Card className="admin-shortcuts">
        <CardHeader
          eyebrow="Go deeper"
          title="Administrative spaces"
          subtitle="Each space keeps its actions scoped to verified endpoints."
        />
        <div className="admin-shortcut-grid">
          <Link to="/admin/users" className="admin-shortcut">
            <UsersIcon size={20} />
            <span>
              <strong>Users</strong>
              <small>Activate, verify and grant admin</small>
            </span>
            <ArrowRightIcon size={16} />
          </Link>
          <Link to="/admin/appointments" className="admin-shortcut">
            <CalendarIcon size={20} />
            <span>
              <strong>Appointments</strong>
              <small>Confirm, cancel and set meeting links</small>
            </span>
            <ArrowRightIcon size={16} />
          </Link>
          <Link to="/admin/applications" className="admin-shortcut">
            <SparkIcon size={20} />
            <span>
              <strong>Applications</strong>
              <small>Review professional applications</small>
            </span>
            <ArrowRightIcon size={16} />
          </Link>
          <Link to="/admin/reports" className="admin-shortcut">
            <MoodIcon size={20} />
            <span>
              <strong>Reports</strong>
              <small>Activity over 7, 30 or 90 days</small>
            </span>
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Ethics"
          title="What this dashboard will not show"
          subtitle="Analytics here are deliberately limited."
        />
        <ul className="admin-ethics">
          <li>No assessment answers, scores, severity levels or interpretations.</li>
          <li>No mood scores, labels or notes.</li>
          <li>No notification titles or contents.</li>
          <li>No private messages or chat transcripts.</li>
        </ul>
      </Card>
    </div>
  );
}
