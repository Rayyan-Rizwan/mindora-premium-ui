import type { ReactNode } from "react";
import { formatDate } from "@/lib/date";
import { classNames } from "@/lib/utils";
import type { AdminReportDailyPoint } from "@/types";
import { Card, CardHeader } from "@/components/ui";

export function AdminStat({
  label,
  value,
  hint,
  tone = "brand",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "brand" | "lavender" | "peach" | "mist" | "sage";
}) {
  return (
    <div className={classNames("admin-stat", `admin-stat--${tone}`)}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

export function Breakdown({
  title,
  subtitle,
  values,
}: {
  title: string;
  subtitle?: string;
  values: Record<string, number>;
}) {
  const entries = Object.entries(values);
  const max = Math.max(1, ...entries.map(([, value]) => value));

  return (
    <Card className="admin-breakdown">
      <CardHeader title={title} subtitle={subtitle} />
      {entries.length === 0 ? (
        <p className="muted">No records yet.</p>
      ) : (
        <ul className="breakdown-list">
          {entries.map(([label, value]) => (
            <li key={label}>
              <div className="breakdown-list__row">
                <span className="capitalize">{label.replace(/_/g, " ")}</span>
                <strong>{value}</strong>
              </div>
              <div className="breakdown-list__bar" aria-hidden="true">
                <span style={{ width: `${(value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function DailyBars({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle?: string;
  data: AdminReportDailyPoint[];
}) {
  const total = data.reduce((sum, point) => sum + point.count, 0);
  const max = Math.max(1, ...data.map((point) => point.count));
  const first = data[0];
  const last = data[data.length - 1];

  return (
    <Card className="admin-daily">
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={<strong className="admin-daily__total">{total}</strong>}
      />
      {data.length === 0 ? (
        <p className="muted">No activity in this period.</p>
      ) : (
        <>
          <div className="daily-bars" aria-hidden="true">
            {data.map((point) => (
              <span
                key={point.date}
                className="daily-bars__bar"
                style={{
                  height: `${Math.max(3, (point.count / max) * 100)}%`,
                }}
                title={`${point.date}: ${point.count}`}
              />
            ))}
          </div>
          <div className="admin-daily__axis">
            <span>{first ? formatDate(first.date) : ""}</span>
            <span>{last ? formatDate(last.date) : ""}</span>
          </div>
          <ul className="sr-only">
            {data.map((point) => (
              <li key={point.date}>
                {formatDate(point.date)}: {point.count}
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
