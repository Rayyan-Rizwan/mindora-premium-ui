import { Link } from "react-router-dom";
import { classNames } from "@/lib/utils";

export function Logo({
  to = "/",
  compact = false,
  tagline,
  className,
}: {
  to?: string;
  compact?: boolean;
  tagline?: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={classNames("logo", className)}
      aria-label="Mindora home"
    >
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" role="presentation">
          <defs>
            <linearGradient id="mindora-mark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d3c5f3" />
              <stop offset="100%" stopColor="#a78fdc" />
            </linearGradient>
          </defs>
          <path
            d="M20 4.6c7.3 0 13.2 6.2 13.2 14.5 0 8-5.9 16.3-13.2 16.3S6.8 27.1 6.8 19.1C6.8 10.8 12.7 4.6 20 4.6Z"
            fill="url(#mindora-mark)"
          />
          <path
            d="M20 9.4c0-3 .2-4.8.8-6.6"
            stroke="#8fae98"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="16.6" cy="3.4" rx="4.4" ry="2.2" fill="#a9c9b3" transform="rotate(26 16.6 3.4)" />
          <ellipse cx="23.6" cy="3.4" rx="4.4" ry="2.2" fill="#8fae98" transform="rotate(-26 23.6 3.4)" />
          <circle cx="16.3" cy="17.4" r="1.7" fill="#3c3354" />
          <circle cx="23.7" cy="17.4" r="1.7" fill="#3c3354" />
          <circle cx="16.8" cy="16.8" r="0.55" fill="#ffffff" />
          <circle cx="24.2" cy="16.8" r="0.55" fill="#ffffff" />
          <ellipse cx="13.3" cy="21" rx="2.1" ry="1.2" fill="#f0b9a6" opacity="0.6" />
          <ellipse cx="26.7" cy="21" rx="2.1" ry="1.2" fill="#f0b9a6" opacity="0.6" />
          <path
            d="M17.2 21.4c1 1.3 1.9 1.9 2.8 1.9s1.8-.6 2.8-1.9"
            stroke="#3c3354"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      {!compact ? (
        <span className="logo__text">
          <span className="logo__word">Mindora</span>
          {tagline ? <span className="logo__tagline">{tagline}</span> : null}
        </span>
      ) : null}
    </Link>
  );
}
