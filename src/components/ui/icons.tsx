import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4 20l1.8-4.8A7.5 7.5 0 1 1 20 11.5Z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </svg>
  );
}

export function MoodIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8" />
      <path d="M9 9.5h.01M15 9.5h.01" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.5l-1.6-5.3L5 10.6 10.4 9 12 3.5Z" />
      <path d="M18.5 16.5 19.2 19l2.3.7-2.3.7-.7 2.4-.7-2.4-2.3-.7 2.3-.7.7-2.5Z" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="5.5" width="16" height="15" rx="3" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19c.5-3 2.7-4.6 5.5-4.6s5 1.6 5.5 4.6" />
      <path d="M15.5 5.8a3 3 0 0 1 0 5.6M17 14.6c2 .5 3.3 2 3.6 4.4" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19 13.2v-2.4l-1.9-.5a5.4 5.4 0 0 0-.6-1.4l1-1.7-1.7-1.7-1.7 1a5.4 5.4 0 0 0-1.4-.6L12.2 4h-2.4l-.5 1.9a5.4 5.4 0 0 0-1.4.6l-1.7-1-1.7 1.7 1 1.7a5.4 5.4 0 0 0-.6 1.4L3 10.8v2.4l1.9.5a5.4 5.4 0 0 0 .6 1.4l-1 1.7 1.7 1.7 1.7-1a5.4 5.4 0 0 0 1.4.6l.5 1.9h2.4l.5-1.9a5.4 5.4 0 0 0 1.4-.6l1.7 1 1.7-1.7-1-1.7a5.4 5.4 0 0 0 .6-1.4l1.9-.5Z" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 4.2a4.8 4.8 0 0 0-4.8 4.8c0 3.2-1 4.2-1 4.2h11.6s-1-1-1-4.2A4.8 4.8 0 0 0 10 4.2Z" transform="translate(2 1.5)" />
      <path d="M10.5 17.2a2 2 0 0 0 3.4 0" transform="translate(2 1.5)" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 19 6v5.3c0 4.3-2.8 7.6-7 9.2-4.2-1.6-7-4.9-7-9.2V6l7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12H5m6-6-6 6 6 6" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4 12 16-7-5.5 14-3-5.5L4 12Z" />
      <path d="m11.5 13.5 4-4" />
    </svg>
  );
}

export function MicIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="4" width="6" height="10" rx="3" />
      <path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3" />
    </svg>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function DotsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 6.5C10.4 5.2 8.5 4.6 5 4.6v13.2c3.5 0 5.4.6 7 1.9 1.6-1.3 3.5-1.9 7-1.9V4.6c-3.5 0-5.4.6-7 1.9Z" />
      <path d="M12 6.5v13.2" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 12.5 4.5 4L19 7" />
    </svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 19c8.5 1 14-4.5 14-14-9.5 0-14 5.5-14 14Z" />
      <path d="M5 19c2.5-4 5.5-6.5 9.5-8.5" />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v11M7.5 11 12 15.5 16.5 11" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19.5 14.4A7.6 7.6 0 0 1 9.6 4.5a7.5 7.5 0 1 0 9.9 9.9Z" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 5.2v13.6L19 12 8 5.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="13.6" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StopIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="3" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
      <circle cx="12" cy="15.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5 19.5c.8-3.3 3.5-5.2 7-5.2s6.2 1.9 7 5.2" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.8 12S6.4 5.8 12 5.8 21.2 12 21.2 12 17.6 18.2 12 18.2 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.4 8.6C4.8 6.9 7.7 4.8 12 4.8c5.6 0 9.2 6.2 9.2 6.2a17 17 0 0 1-3 3.6" />
      <path d="M6.3 16.4A16.6 16.6 0 0 1 2.8 12S6.4 5.8 12 5.8" />
      <path d="m4 4 16 16" />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M15.9 12.5c0-2 1.6-2.9 1.7-3-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.5 2.1 2.5 2 1 0 1.4-.6 2.6-.6s1.6.6 2.6.6c1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4 0 0-2.1-.8-2.2-3Z" />
      <path d="M13.8 6.3c.5-.7.9-1.6.8-2.5-.8 0-1.8.5-2.4 1.2-.5.6-1 1.5-.8 2.4.9.1 1.8-.4 2.4-1.1Z" />
    </svg>
  );
}

export function GoogleIcon(props: IconProps) {
  return (
    <svg {...base(props)} stroke="none">
      <path fill="#4285F4" d="M21.4 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.3a4.5 4.5 0 0 1-2 3v2.5h3.2c1.9-1.7 2.9-4.3 2.9-7.4Z" />
      <path fill="#34A853" d="M12 21.8c2.7 0 5-.9 6.5-2.3l-3.2-2.5c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.3v2.6A9.8 9.8 0 0 0 12 21.8Z" />
      <path fill="#FBBC05" d="M6.6 14a5.9 5.9 0 0 1 0-3.8V7.6H3.3a9.8 9.8 0 0 0 0 8.9L6.6 14Z" />
      <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.6 9.6 0 0 0 12 2.2a9.8 9.8 0 0 0-8.7 5.4L6.6 10c.7-2.2 2.9-3.9 5.4-3.9Z" />
    </svg>
  );
}

export function TimerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9.5V13l2.4 1.6M9.5 3.5h5M12 3.5v2" />
    </svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  );
}

export function SkipBackIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M6.5 5.5a1 1 0 0 1 2 0v13a1 1 0 0 1-2 0v-13Z" />
      <path d="M18.3 6.1a1 1 0 0 0-1.5-.9l-8 5.5a1 1 0 0 0 0 1.6l8 5.5a1 1 0 0 0 1.5-.8V6.1Z" />
    </svg>
  );
}

export function SkipForwardIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M17.5 5.5a1 1 0 0 0-2 0v13a1 1 0 0 0 2 0v-13Z" />
      <path d="M5.7 6.1a1 1 0 0 1 1.5-.9l8 5.5a1 1 0 0 1 0 1.6l-8 5.5a1 1 0 0 1-1.5-.8V6.1Z" />
    </svg>
  );
}

export function ShuffleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7h2.6c1.4 0 2.4.6 3.2 1.8l6.4 8.4c.8 1.2 1.8 1.8 3.2 1.8H21" />
      <path d="M3 17h2.6c1.4 0 2.4-.6 3.2-1.8l6.4-8.4c.8-1.2 1.8-1.8 3.2-1.8H21" />
      <path d="m18.5 3.5 2.5 2.5-2.5 2.5M18.5 15.5 21 18l-2.5 2.5" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20.3s-7.5-4.4-7.5-9.6A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 3.1c0 5.2-7.5 9.6-7.5 9.6Z" />
    </svg>
  );
}

export function HeadphonesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 14v-1.5a8 8 0 0 1 16 0V14" />
      <rect x="3.2" y="13.5" width="4.4" height="6.5" rx="2" />
      <rect x="16.4" y="13.5" width="4.4" height="6.5" rx="2" />
    </svg>
  );
}
