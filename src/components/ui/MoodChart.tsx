import { useId } from "react";
import { formatDate } from "@/lib/date";
import type { MoodSummary } from "@/types";

interface Point {
  date: string;
  score: number;
}

export function MoodChart({
  data,
  height = 220,
}: {
  data: Point[];
  height?: number;
}) {
  const gradientId = useId();

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>Your trend line appears after your first check-in.</p>
      </div>
    );
  }

  const width = 720;
  const padding = { top: 18, right: 18, bottom: 28, left: 34 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxScore = 10;
  const minScore = 1;

  const stepX =
    data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const points = data.map((point, index) => {
    const x =
      padding.left +
      (data.length > 1 ? index * stepX : innerWidth / 2);
    const y =
      padding.top +
      innerHeight -
      ((point.score - minScore) / (maxScore - minScore)) * innerHeight;
    return { ...point, x, y };
  });

  const line = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`,
    )
    .join(" ");

  const area = `${line} L${points[points.length - 1].x.toFixed(1)},${
    padding.top + innerHeight
  } L${points[0].x.toFixed(1)},${padding.top + innerHeight} Z`;

  const summary = data
    .map((point) => `${formatDate(point.date)}: ${point.score}/10`)
    .join(", ");

  return (
    <figure className="mood-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Mood trend. ${summary}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-2)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--brand-2)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[2, 4, 6, 8, 10].map((tick) => {
          const y =
            padding.top +
            innerHeight -
            ((tick - minScore) / (maxScore - minScore)) * innerHeight;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                className="mood-chart__grid"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="mood-chart__tick"
              >
                {tick}
              </text>
            </g>
          );
        })}

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} className="mood-chart__line" />

        {points.map((point) => (
          <g key={point.date}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5.5"
              className="mood-chart__dot"
            >
              <title>
                {formatDate(point.date)} — {point.score}/10
              </title>
            </circle>
          </g>
        ))}
      </svg>
    </figure>
  );
}

export function MoodSparkline({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return <div className="sparkline sparkline--empty" aria-hidden="true" />;
  }

  const width = 220;
  const height = 64;
  const step = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data.map((point, index) => {
    const x = data.length > 1 ? index * step : width / 2;
    const y = height - 6 - ((point.score - 1) / 9) * (height - 12);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={`M${points.join(" L")}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function moodSeries(summary: MoodSummary | null) {
  if (!summary) return [];
  return summary.moods.map((mood) => ({
    date: mood.date,
    score: mood.score,
  }));
}
