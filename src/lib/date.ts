/**
 * The backend serialises naive UTC datetimes (no offset). Appending "Z" makes
 * the browser interpret them as UTC, matching the existing frontend behaviour.
 */
export function parseUtcDate(value: string): Date {
  // Date-only values (mood dates, report buckets) are calendar days, so they
  // are parsed locally to avoid showing the previous day west of UTC.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }
  const normalized = /(Z|[+-]\d{2}:?\d{2})$/.test(value)
    ? value
    : `${value}Z`;
  return new Date(normalized);
}

export function formatDateTime(value: string): string {
  return parseUtcDate(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(value: string): string {
  return parseUtcDate(value).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

export function formatShortDate(value: string): string {
  return parseUtcDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function localDayString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysAgoString(daysAgo: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return localDayString(date);
}

export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 5) return "A quiet moment";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Winding down";
}

export function relativeTime(value: string): string {
  const date = parseUtcDate(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60_000);

  if (!Number.isFinite(minutes)) return "";
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}
