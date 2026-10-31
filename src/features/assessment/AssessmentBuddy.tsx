import { useId } from "react";

function uidOf(raw: string) {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "");
}

function Sparkle({
  x,
  y,
  scale = 1,
  fill,
  opacity = 1,
}: {
  x: number;
  y: number;
  scale?: number;
  fill: string;
  opacity?: number;
}) {
  return (
    <path
      d="M0 -7 C1.2 -2.4 2.4 -1.2 7 0 C2.4 1.2 1.2 2.4 0 7 C-1.2 2.4 -2.4 1.2 -7 0 C-2.4 -1.2 -1.2 -2.4 0 -7 Z"
      fill={fill}
      opacity={opacity}
      transform={`translate(${x} ${y}) scale(${scale})`}
    />
  );
}

function Cloud({
  x,
  y,
  scale = 1,
  opacity = 0.5,
}: {
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#ffffff" opacity={opacity}>
      <ellipse cx="0" cy="0" rx="38" ry="12" />
      <ellipse cx="-20" cy="-10" rx="21" ry="16" />
      <ellipse cx="14" cy="-12" rx="25" ry="18" />
    </g>
  );
}

/**
 * Dedicated illustration for the Mental Status Assessment intro. It is a
 * companion-like character rather than a human portrait, so it stays warm and
 * approachable without reusing or altering the global Lumi/Momo/Pip artwork.
 */
export function AssessmentBuddy({ className }: { className?: string }) {
  const uid = uidOf(useId());
  const sky = `${uid}-sky`;
  const moon = `${uid}-moon`;
  const body = `${uid}-body`;
  const belly = `${uid}-belly`;
  const ear = `${uid}-ear`;
  const heart = `${uid}-heart`;
  const glow = `${uid}-glow`;
  const shadow = `${uid}-shadow`;

  return (
    <svg
      viewBox="0 0 480 320"
      className={`assessment-buddy ${className ?? ""}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="A smiling lavender companion with big friendly eyes, hugging a glowing blue heart"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#fcf8ff" />
          <stop offset="54%" stopColor="#eee3ff" />
          <stop offset="100%" stopColor="#d9c8fb" />
        </linearGradient>
        <radialGradient id={moon} cx="50%" cy="44%" r="52%">
          <stop offset="0%" stopColor="#fffdf6" />
          <stop offset="55%" stopColor="#f8edff" stopOpacity="0.82" />
          <stop offset="82%" stopColor="#eddaff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#eddaff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={body} x1="0.18" y1="0.05" x2="0.82" y2="1">
          <stop offset="0%" stopColor="#f8f2ff" />
          <stop offset="46%" stopColor="#dccbff" />
          <stop offset="100%" stopColor="#b296ea" />
        </linearGradient>
        <radialGradient id={belly} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#fffdf9" />
          <stop offset="100%" stopColor="#f6eaff" />
        </radialGradient>
        <linearGradient id={ear} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#f9c7e5" />
          <stop offset="100%" stopColor="#e9a3d0" />
        </linearGradient>
        <linearGradient id={heart} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#d9efff" />
          <stop offset="55%" stopColor="#a9cdf6" />
          <stop offset="100%" stopColor="#7fb0e8" />
        </linearGradient>
        <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#a9cdf6" floodOpacity="0.65" />
        </filter>
        <filter id={shadow} x="-50%" y="-120%" width="200%" height="340%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <rect width="480" height="320" fill={`url(#${sky})`} />
      <circle cx="240" cy="150" r="150" fill={`url(#${moon})`} />

      <Cloud x={58} y={80} scale={0.9} opacity={0.6} />
      <Cloud x={424} y={64} scale={0.72} opacity={0.5} />
      <Cloud x={30} y={204} scale={0.55} opacity={0.35} />
      <Cloud x={450} y={192} scale={0.6} opacity={0.32} />

      <Sparkle x={110} y={120} scale={0.8} fill="#b9a6f2" opacity={0.9} />
      <Sparkle x={372} y={96} scale={0.7} fill="#a8c8ee" opacity={0.9} />
      <Sparkle x={92} y={62} scale={0.5} fill="#d9c8ff" opacity={0.8} />
      <Sparkle x={398} y={178} scale={0.55} fill="#f7c6df" opacity={0.8} />
      <Sparkle x={140} y={190} scale={0.45} fill="#cfe3ff" opacity={0.8} />
      <Sparkle x={340} y={212} scale={0.5} fill="#e5d6ff" opacity={0.8} />
      <Sparkle x={240} y={54} scale={0.9} fill="#fff4cf" opacity={0.95} />

      <path
        d="M0 7 C-7 2 -12 -3 -12 -8 C-12 -13 -6 -15 0 -11 C6 -15 12 -13 12 -8 C12 -3 7 2 0 7 Z"
        fill="#f6b8d5"
        opacity={0.8}
        transform="translate(158 108) scale(0.9)"
      />
      <path
        d="M0 7 C-7 2 -12 -3 -12 -8 C-12 -13 -6 -15 0 -11 C6 -15 12 -13 12 -8 C12 -3 7 2 0 7 Z"
        fill="#a9cdf6"
        opacity={0.85}
        transform="translate(330 132) scale(0.65)"
      />

      {/* Meadow */}
      <path
        d="M0 278 C66 262 122 272 186 282 C258 293 330 270 480 280 L480 320 L0 320 Z"
        fill="#a78fdb"
        opacity={0.72}
      />
      <path
        d="M0 296 C84 278 150 296 232 300 C322 304 394 282 480 296 L480 320 L0 320 Z"
        fill="#6d59a5"
      />
      <path
        d="M0 308 C96 296 180 308 268 310 C350 312 418 300 480 306 L480 320 L0 320 Z"
        fill="#50407f"
      />
      <g opacity={0.9}>
        <path d="M92 312v-9M128 307v-8M356 310v-8M392 305v-7" stroke="#8f7ac4" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="92" cy="300" r="2.6" fill="#f3c9e2" />
        <circle cx="128" cy="296" r="2.2" fill="#d9c8ff" />
        <circle cx="356" cy="299" r="2.4" fill="#cfe3ff" />
        <circle cx="392" cy="295" r="2.1" fill="#f7c6df" />
      </g>

      <ellipse
        cx="240"
        cy="288"
        rx="62"
        ry="10"
        fill="#4b3b7a"
        opacity={0.22}
        filter={`url(#${shadow})`}
      />

      {/* Ears */}
      <g transform="translate(202 96) rotate(-15)">
        <path
          d="M0 0 C-24 -18 -28 -54 -10 -74 C-2 -82 10 -76 14 -58 C20 -32 14 -8 0 0 Z"
          fill={`url(#${body})`}
          stroke="#7a63b4"
          strokeOpacity={0.32}
          strokeWidth="2"
        />
        <path
          d="M-2 -10 C-14 -26 -16 -48 -6 -60 C1 -66 8 -60 9 -48 C11 -30 7 -14 -2 -10 Z"
          fill={`url(#${ear})`}
        />
      </g>
      <g transform="translate(278 96) rotate(13) scale(-1 1)">
        <path
          d="M0 0 C-24 -18 -28 -54 -10 -74 C-2 -82 10 -76 14 -58 C20 -32 14 -8 0 0 Z"
          fill={`url(#${body})`}
          stroke="#7a63b4"
          strokeOpacity={0.32}
          strokeWidth="2"
        />
        <path
          d="M-2 -10 C-14 -26 -16 -48 -6 -60 C1 -66 8 -60 9 -48 C11 -30 7 -14 -2 -10 Z"
          fill={`url(#${ear})`}
        />
      </g>

      {/* Body and feet */}
      <path
        d="M178 202 C164 228 168 250 184 262 C198 272 282 272 296 262 C312 250 316 228 302 202 C280 188 200 188 178 202 Z"
        fill={`url(#${body})`}
        stroke="#7a63b4"
        strokeOpacity={0.3}
        strokeWidth="2"
      />
      <ellipse cx="214" cy="272" rx="18" ry="9.5" fill="#a98ee6" />
      <ellipse cx="266" cy="272" rx="18" ry="9.5" fill="#a98ee6" />
      <ellipse cx="210" cy="270" rx="7" ry="3.4" fill="#efe4ff" opacity={0.75} />
      <ellipse cx="262" cy="270" rx="7" ry="3.4" fill="#efe4ff" opacity={0.75} />
      <ellipse cx="240" cy="228" rx="38" ry="34" fill={`url(#${belly})`} opacity={0.9} />

      {/* Head */}
      <ellipse
        cx="240"
        cy="146"
        rx="74"
        ry="68"
        fill={`url(#${body})`}
        stroke="#7a63b4"
        strokeOpacity={0.3}
        strokeWidth="2"
      />
      <path
        d="M184 112 C192 89 212 77 234 76"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        opacity={0.5}
      />
      <path
        d="M184 212 C179 234 183 250 192 260"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        opacity={0.28}
      />

      {/* Arms hugging the heart */}
      <path
        d="M188 214 C192 228 204 236 218 234"
        fill="none"
        stroke="#cdb8f7"
        strokeWidth="17"
        strokeLinecap="round"
      />
      <path
        d="M292 214 C288 228 276 236 262 234"
        fill="none"
        stroke="#cdb8f7"
        strokeWidth="17"
        strokeLinecap="round"
      />
      <path
        d="M240 244 C225 233 212 222 212 209 C212 198 225 193 236 199 C239 201 240 204 240 206 C240 204 241 201 244 199 C255 193 268 198 268 209 C268 222 255 233 240 244 Z"
        fill={`url(#${heart})`}
        filter={`url(#${glow})`}
      />
      <path
        d="M224 206 C229 201 237 202 240 207"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity={0.75}
      />
      <circle cx="218" cy="236" r="9" fill="#efe4ff" stroke="#b296ea" strokeWidth="1.4" />
      <circle cx="262" cy="236" r="9" fill="#efe4ff" stroke="#b296ea" strokeWidth="1.4" />

      {/* Face */}
      <path
        d="M200 117 Q211 112 221 117"
        fill="none"
        stroke="#8a6aa0"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.28}
      />
      <path
        d="M259 117 Q269 112 280 117"
        fill="none"
        stroke="#8a6aa0"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.28}
      />
      <ellipse cx="211" cy="140" rx="10.5" ry="13.5" fill="#322a5c" />
      <ellipse cx="269" cy="140" rx="10.5" ry="13.5" fill="#322a5c" />
      <circle cx="207.5" cy="135" r="4" fill="#ffffff" />
      <circle cx="265.5" cy="135" r="4" fill="#ffffff" />
      <circle cx="214.5" cy="146" r="1.8" fill="#ffffff" opacity={0.85} />
      <circle cx="272.5" cy="146" r="1.8" fill="#ffffff" opacity={0.85} />
      <ellipse cx="191" cy="160" rx="10.5" ry="6" fill="#f4a3ca" opacity={0.45} />
      <ellipse cx="289" cy="160" rx="10.5" ry="6" fill="#f4a3ca" opacity={0.45} />
      <ellipse cx="240" cy="154" rx="2.2" ry="1.7" fill="#d795b5" opacity={0.8} />
      <path
        d="M227 163 Q240 172 253 163"
        fill="none"
        stroke="#6a4b7d"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
