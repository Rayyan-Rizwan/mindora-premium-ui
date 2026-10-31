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

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="4.5" width="14" height="16.5" rx="3" />
      <path d="M9 4.5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8v.7" />
      <path d="M9 12.2l2.2 2.2L15.4 10" />
      <path d="M9 17h6" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.6V12l3 1.9" />
    </svg>
  );
}

export function CloudUploadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.4 18.4a4.4 4.4 0 0 1-.5-8.8 5.6 5.6 0 0 1 10.7-1.2 4.2 4.2 0 0 1 .9 8.3" />
      <path d="M12 20V11.8" />
      <path d="M8.8 14.6 12 11.4l3.2 3.2" />
    </svg>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3.4h6.2L18 8.2v10.6a1.8 1.8 0 0 1-1.8 1.8H7A1.8 1.8 0 0 1 5.2 18.8V5.2A1.8 1.8 0 0 1 7 3.4Z" />
      <path d="M13 3.6v4.8h4.8" />
      <path d="M8.4 13h7M8.4 16.4h5" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

export function CircleAlertIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.8v4.8" />
      <circle cx="12" cy="16.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m8.4 12.2 2.4 2.4 4.8-4.9" />
    </svg>
  );
}
