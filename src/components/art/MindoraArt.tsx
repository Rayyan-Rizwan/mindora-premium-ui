import { useId } from "react";
import type { ThemeName } from "@/lib/theme";

/**
 * Original, hand-authored SVG artwork for the Task 4 screens. Nothing here is
 * a filtered copy of a single scene: each theme landscape has its own
 * composition, horizon and character pose.
 */

function uidOf(raw: string) {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "");
}

function SoftCloud({
  x,
  y,
  scale = 1,
  fill,
  opacity = 0.9,
}: {
  x: number;
  y: number;
  scale?: number;
  fill: string;
  opacity?: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill={fill}
      opacity={opacity}
    >
      <ellipse cx="0" cy="0" rx="26" ry="10" />
      <ellipse cx="-15" cy="-7" rx="14" ry="11" />
      <ellipse cx="8" cy="-10" rx="17" ry="13" />
      <ellipse cx="22" cy="-2" rx="12" ry="8" />
    </g>
  );
}

function Sparkle({
  x,
  y,
  scale = 1,
  fill,
}: {
  x: number;
  y: number;
  scale?: number;
  fill: string;
}) {
  return (
    <path
      d="M0 -6 C1 -2 2 -1 6 0 C2 1 1 2 0 6 C-1 2 -2 1 -6 0 C-2 -1 -1 -2 0 -6 Z"
      fill={fill}
      transform={`translate(${x} ${y}) scale(${scale})`}
    />
  );
}

function Blossom({
  x,
  y,
  size = 1,
  petal,
  core,
  rotate = 0,
}: {
  x: number;
  y: number;
  size?: number;
  petal: string;
  core: string;
  rotate?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${size})`}>
      <g fill={petal}>
        <ellipse cx="0" cy="-5.6" rx="3.6" ry="5" />
        <ellipse cx="0" cy="-5.6" rx="3.6" ry="5" transform="rotate(72)" />
        <ellipse cx="0" cy="-5.6" rx="3.6" ry="5" transform="rotate(144)" />
        <ellipse cx="0" cy="-5.6" rx="3.6" ry="5" transform="rotate(216)" />
        <ellipse cx="0" cy="-5.6" rx="3.6" ry="5" transform="rotate(288)" />
      </g>
      <circle cx="0" cy="0" r="2.6" fill={core} />
    </g>
  );
}

function Sprig({
  x,
  y,
  scale = 1,
  rotate = 0,
  stem,
  leaf,
}: {
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  stem: string;
  leaf: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0 40 C-4 22 -3 8 0 -4" fill="none" stroke={stem} strokeWidth="2" strokeLinecap="round" />
      <path d="M0 26 C-12 24 -18 14 -20 4 C-9 6 -2 15 0 26 Z" fill={leaf} />
      <path d="M0 14 C10 12 17 3 19 -7 C8 -5 1 3 0 14 Z" fill={leaf} opacity="0.86" />
    </g>
  );
}

/* ------------------------- Assessment heroine ---------------------------- */

export function HeartGirlArt({ className }: { className?: string }) {
  const uid = uidOf(useId());
  const sky = `${uid}-sky`;
  const glow = `${uid}-glow`;
  const heart = `${uid}-heart`;
  const dress = `${uid}-dress`;
  const hair = `${uid}-hair`;

  return (
    <svg
      viewBox="0 0 360 300"
      className={`mindora-art heart-girl-art ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Illustration of a peaceful girl holding a peach-pink heart, surrounded by flowers and soft clouds"
    >
      <defs>
        <radialGradient id={sky} cx="50%" cy="42%" r="72%">
          <stop offset="0%" stopColor="#fffaf4" />
          <stop offset="62%" stopColor="#fdf0ee" />
          <stop offset="100%" stopColor="#f7e7f2" />
        </radialGradient>
        <radialGradient id={glow} cx="50%" cy="46%" r="50%">
          <stop offset="0%" stopColor="#ffe6ee" stopOpacity="0.92" />
          <stop offset="70%" stopColor="#ffd9e6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffd9e6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={heart} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ffc9c4" />
          <stop offset="58%" stopColor="#f7a7b2" />
          <stop offset="100%" stopColor="#ea8a9f" />
        </linearGradient>
        <linearGradient id={dress} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#ffe9dc" />
          <stop offset="100%" stopColor="#f6c7bf" />
        </linearGradient>
        <linearGradient id={hair} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#6d4c74" />
          <stop offset="55%" stopColor="#573a60" />
          <stop offset="100%" stopColor="#452d4e" />
        </linearGradient>
      </defs>

      <rect width="360" height="300" fill={`url(#${sky})`} />
      <circle cx="180" cy="150" r="132" fill={`url(#${glow})`} />

      <SoftCloud x={54} y={74} scale={0.92} fill="#fffaf6" opacity={0.92} />
      <SoftCloud x={306} y={58} scale={0.72} fill="#fffaf6" opacity={0.86} />
      <SoftCloud x={300} y={122} scale={0.5} fill="#fff8f2" opacity={0.7} />
      <SoftCloud x={38} y={132} scale={0.5} fill="#fff8f2" opacity={0.66} />

      <Sparkle x={104} y={62} scale={0.9} fill="#d9b8e8" />
      <Sparkle x={258} y={48} scale={0.75} fill="#e7c3dc" />
      <Sparkle x={320} y={168} scale={0.7} fill="#e8c6b5" />
      <Sparkle x={48} y={186} scale={0.62} fill="#d8c4ee" />
      <Sparkle x={238} y={98} scale={0.5} fill="#f0c3cf" />
      <Sparkle x={128} y={120} scale={0.44} fill="#efc9d6" />

      {/* Hair behind the shoulders */}
      <path
        d="M180 48 C132 48 120 82 125 116 C128 142 121 168 111 196 C105 213 105 226 112 238 C128 234 141 225 149 214 L211 214 C219 225 232 234 248 238 C255 226 255 213 249 196 C239 168 232 142 235 116 C240 82 228 48 180 48 Z"
        fill={`url(#${hair})`}
      />

      {/* Dress and shoulders */}
      <path
        d="M132 300 L139 216 C147 191 213 191 221 216 L228 300 Z"
        fill={`url(#${dress})`}
      />
      <path
        d="M152 205 C160 214 200 214 208 205 C204 196 199 192 192 191 L168 191 C161 192 156 196 152 205 Z"
        fill="#f8d3c9"
      />

      <rect x="169" y="136" width="22" height="22" rx="10" fill="#f3c2a9" />

      {/* Head */}
      <ellipse cx="180" cy="104" rx="35" ry="38" fill="#f8cfb8" />
      <ellipse cx="146" cy="109" rx="6" ry="8" fill="#f3c2a9" />
      <ellipse cx="214" cy="109" rx="6" ry="8" fill="#f3c2a9" />

      {/* Fringe and side locks */}
      <path
        d="M145 96 C144 70 159 58 180 58 C201 58 216 70 215 96 C208 84 200 79 193 81 C187 86 184 91 180 96 C175 88 168 84 160 85 C153 86 148 90 145 96 Z"
        fill={`url(#${hair})`}
      />
      <path
        d="M146 88 C133 101 130 132 135 164 C139 183 146 198 154 208 C150 178 150 145 157 118 Z"
        fill={`url(#${hair})`}
      />
      <path
        d="M214 88 C227 101 230 132 225 164 C221 183 214 198 206 208 C210 178 210 145 203 118 Z"
        fill={`url(#${hair})`}
      />
      <path
        d="M139 106 C133 124 134 148 140 170"
        fill="none"
        stroke="#7d5a86"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M221 106 C227 124 226 148 220 170"
        fill="none"
        stroke="#7d5a86"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Face */}
      <path
        d="M161 100 C165 97 170 97 174 100"
        fill="none"
        stroke="#8b6077"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M186 100 C190 97 195 97 199 100"
        fill="none"
        stroke="#8b6077"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M162 110 C166 114 171 114 175 110"
        fill="none"
        stroke="#4d3557"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M185 110 C189 114 194 114 198 110"
        fill="none"
        stroke="#4d3557"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <ellipse cx="158" cy="119" rx="8" ry="4.4" fill="#f19a9c" opacity="0.5" />
      <ellipse cx="202" cy="119" rx="8" ry="4.4" fill="#f19a9c" opacity="0.5" />
      <path
        d="M180 114 C178 117 178 118 180 119"
        fill="none"
        stroke="#dda78f"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M173 124 C176 128 184 128 187 124"
        fill="none"
        stroke="#bd6f7c"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Flower crown */}
      <Sprig x={137} y={79} scale={0.6} rotate={-38} stem="#9fbc9f" leaf="#b6d2b3" />
      <Blossom x={143} y={75} size={1.05} petal="#f7c6d4" core="#f6e2a8" rotate={-8} />
      <Blossom x={155} y={66} size={0.85} petal="#f3b6c9" core="#fbe7b5" rotate={14} />
      <Blossom x={168} y={62} size={0.7} petal="#f9d2dd" core="#f5d79b" rotate={-18} />
      <Blossom x={211} y={82} size={0.62} petal="#f6c1d0" core="#f7e3ab" rotate={20} />
      <Blossom x={201} y={68} size={0.55} petal="#fbd5e0" core="#f6d99f" rotate={-6} />

      {/* Arms */}
      <path
        d="M147 213 C151 230 160 240 172 237"
        fill="none"
        stroke="#f8cfb8"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path
        d="M213 213 C209 230 200 240 188 237"
        fill="none"
        stroke="#f8cfb8"
        strokeWidth="13"
        strokeLinecap="round"
      />

      {/* Heart */}
      <path
        d="M180 252 C167 240 145 224 145 207 C145 195 157 189 168 194 C174 197 178 202 180 208 C182 202 186 197 192 194 C203 189 215 195 215 207 C215 224 193 240 180 252 Z"
        fill={`url(#${heart})`}
      />
      <path
        d="M159 202 C164 197 172 198 176 204"
        fill="none"
        stroke="#fff4f1"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <ellipse cx="149" cy="229" rx="8" ry="9" fill="#f8cfb8" transform="rotate(-22 149 229)" />
      <ellipse cx="211" cy="229" rx="8" ry="9" fill="#f8cfb8" transform="rotate(22 211 229)" />
      <path
        d="M145 227 C148 225 151 226 152 229"
        fill="none"
        stroke="#e3ab92"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M215 227 C212 225 209 226 208 229"
        fill="none"
        stroke="#e3ab92"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Garden */}
      <g>
        <Sprig x={68} y={246} scale={0.95} rotate={-14} stem="#a3c0a3" leaf="#b8d4b6" />
        <Sprig x={292} y={242} scale={1} rotate={16} stem="#a3c0a3" leaf="#b8d4b6" />
        <Sprig x={98} y={258} scale={0.7} rotate={12} stem="#a3c0a3" leaf="#c0d8bc" />
        <Blossom x={62} y={244} size={1.15} petal="#e3cdf2" core="#f7e2aa" />
        <Blossom x={80} y={262} size={0.9} petal="#f5c6d4" core="#f6dfa5" rotate={18} />
        <Blossom x={298} y={238} size={1.05} petal="#f2bccd" core="#f8e4ae" rotate={-14} />
        <Blossom x={282} y={262} size={0.8} petal="#e6d0f4" core="#f6dda4" rotate={22} />
        <path
          d="M110 274 C126 262 142 260 156 264"
          fill="none"
          stroke="#a9c3a5"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M250 274 C236 264 224 262 212 266"
          fill="none"
          stroke="#a9c3a5"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>
    </svg>
  );
}

/* --------------------------- Theme landscapes ---------------------------- */

type LandscapeProps = { theme: ThemeName; className?: string };

export function ThemeLandscape({ theme, className }: LandscapeProps) {
  const uid = uidOf(useId());
  const sky = `${uid}-sky`;

  return (
    <svg
      viewBox="0 0 220 130"
      className={`theme-landscape theme-landscape--${theme} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0.2" y2="1">
          {theme === "lavender" ? (
            <>
              <stop offset="0%" stopColor="#f8f1fd" />
              <stop offset="100%" stopColor="#e6d8f6" />
            </>
          ) : theme === "peach" ? (
            <>
              <stop offset="0%" stopColor="#fff3e6" />
              <stop offset="100%" stopColor="#f9d6c1" />
            </>
          ) : theme === "mint" ? (
            <>
              <stop offset="0%" stopColor="#f0faf4" />
              <stop offset="100%" stopColor="#d6eddf" />
            </>
          ) : theme === "sky" ? (
            <>
              <stop offset="0%" stopColor="#edf7ff" />
              <stop offset="100%" stopColor="#cfe5f8" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#fdf2f5" />
              <stop offset="100%" stopColor="#f8d7e1" />
            </>
          )}
        </linearGradient>
      </defs>

      <rect width="220" height="130" fill={`url(#${sky})`} />

      {theme === "lavender" ? <LavenderScene /> : null}
      {theme === "peach" ? <PeachScene /> : null}
      {theme === "mint" ? <MintScene /> : null}
      {theme === "sky" ? <SkyScene /> : null}
      {theme === "rose" ? <RoseScene /> : null}
    </svg>
  );
}

function LavenderScene() {
  return (
    <g>
      <circle cx="176" cy="30" r="20" fill="#fff3cf" opacity="0.35" />
      <circle cx="176" cy="30" r="11" fill="#fff2c8" />
      <circle cx="181" cy="26" r="10" fill="#eee2f8" />
      <Sparkle x={128} y={26} scale={0.5} fill="#c7aee8" />
      <Sparkle x={46} y={42} scale={0.42} fill="#d9c5f0" />
      <Sparkle x={200} y={62} scale={0.34} fill="#c4abe6" />
      <SoftCloud x={56} y={44} scale={0.6} fill="#fffafd" opacity={0.9} />

      <path
        d="M0 86 C34 70 62 72 88 82 C118 94 146 76 176 72 C192 70 208 72 220 78 L220 130 L0 130 Z"
        fill="#d8c6f2"
      />
      <path
        d="M0 106 C38 92 74 98 110 106 C146 114 184 100 220 104 L220 130 L0 130 Z"
        fill="#c5afe9"
      />
      <path
        d="M0 118 C48 110 96 116 142 120 C172 123 198 118 220 116 L220 130 L0 130 Z"
        fill="#eee4fa"
      />

      <g transform="translate(168 62)">
        <rect x="-13" y="8" width="26" height="24" rx="3" fill="#cbb7ed" />
        <rect x="-22" y="18" width="10" height="14" rx="2" fill="#dbcbf3" />
        <rect x="12" y="18" width="10" height="14" rx="2" fill="#dbcbf3" />
        <path d="M-14 9 L0 -4 L14 9 Z" fill="#ad93dc" />
        <path d="M-22 19 L-17 11 L-12 19 Z" fill="#b9a1e1" />
        <path d="M12 19 L17 11 L22 19 Z" fill="#b9a1e1" />
        <rect x="-4" y="17" width="7" height="15" rx="2.5" fill="#f4ebff" opacity="0.8" />
        <circle cx="0" cy="-9" r="1.5" fill="#fff6d6" />
      </g>

      <Sprig x={26} y={82} scale={0.52} rotate={-6} stem="#9dbd9d" leaf="#b4d0ae" />
      <Sprig x={198} y={88} scale={0.44} rotate={10} stem="#9dbd9d" leaf="#b4d0ae" />
      <path d="M30 104 C30 96 30 90 30 86" stroke="#a78fd6" strokeWidth="1.4" fill="none" />
      <g fill="#b69ce0">
        <ellipse cx="30" cy="91" rx="2" ry="3.4" />
        <ellipse cx="30" cy="97" rx="1.7" ry="3" />
        <ellipse cx="30" cy="102" rx="1.4" ry="2.6" />
      </g>
      <Blossom x={196} y={96} size={0.55} petal="#f3d7e5" core="#f6e2a8" rotate={12} />

      <LavenderGirl />
    </g>
  );
}

function LavenderGirl() {
  return (
    <g transform="translate(80 92)">
      <ellipse cx="0" cy="26" rx="22" ry="5" fill="#8f74bd" opacity="0.16" />
      <path d="M-11 22 C-14 12 -9 2 0 0 C9 2 14 12 11 22 Z" fill="#f3d8d0" />
      <path d="M-12 17 C-16 21 -16 24 -12 26 L12 26 C16 24 16 21 12 17 Z" fill="#e9c3bc" />
      <circle cx="0" cy="-10" r="9.4" fill="#f6c6ae" />
      <path
        d="M-10 -12 C-11 -21 -4 -25 0 -25 C5 -25 11 -21 10 -12 C7 -17 3 -18 0 -15 C-4 -18 -7 -17 -10 -12 Z"
        fill="#5a3d62"
      />
      <path d="M-10 -12 C-13 -6 -12 0 -9 4 L-8 -8 Z" fill="#5a3d62" />
      <path d="M10 -12 C13 -6 12 0 9 4 L8 -8 Z" fill="#5a3d62" />
      <path d="M-5 -8 C-3 -6 -1 -6 1 -8" stroke="#4d3557" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M-1 -8 C1 -6 3 -6 5 -8" stroke="#4d3557" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="-5" cy="-4" r="2.4" fill="#f19a9c" opacity="0.45" />
      <circle cx="5" cy="-4" r="2.4" fill="#f19a9c" opacity="0.45" />
      <Blossom x={-9} y={-22} size={0.34} petal="#f7c8d6" core="#f6e2a8" />
      <Blossom x={-2} y={-25} size={0.29} petal="#e8d2f4" core="#f6e2a8" rotate={18} />
      <path d="M-7 5 C-9 8 -8 11 -5 11" stroke="#f6c6ae" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M7 5 C9 8 8 11 5 11" stroke="#f6c6ae" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M-9 10 L-2 13 L-2 18 L-9 16 Z" fill="#fffaf3" stroke="#cbb8e8" strokeWidth="0.8" />
      <path d="M2 13 L9 10 L9 16 L2 18 Z" fill="#fffaf3" stroke="#cbb8e8" strokeWidth="0.8" />
      <path d="M0 13 L0 18" stroke="#cbb8e8" strokeWidth="0.7" />
      <Sparkle x={17} y={-4} scale={0.28} fill="#c4a9e6" />
    </g>
  );
}

function PeachScene() {
  return (
    <g>
      <circle cx="46" cy="34" r="20" fill="#ffd9a6" opacity="0.32" />
      <circle cx="46" cy="34" r="10.5" fill="#ffcf92" />
      <SoftCloud x={92} y={36} scale={0.55} fill="#fffaf5" opacity={0.9} />
      <SoftCloud x={184} y={26} scale={0.42} fill="#fffaf5" opacity={0.8} />

      <path
        d="M0 82 C30 68 58 70 86 80 C116 92 148 72 180 76 C194 78 208 84 220 88 L220 130 L0 130 Z"
        fill="#f7cdb4"
      />
      <path
        d="M0 102 C42 88 80 96 118 104 C154 112 188 98 220 100 L220 130 L0 130 Z"
        fill="#efb395"
      />
      <path
        d="M0 118 C52 110 104 118 154 121 C180 123 202 117 220 116 L220 130 L0 130 Z"
        fill="#fbe6d7"
      />

      <g transform="translate(178 58)">
        <path d="M0 48 C-1 34 0 20 0 8" stroke="#b97f68" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M0 20 C-6 12 -12 10 -18 10" stroke="#b97f68" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M0 26 C6 18 12 16 18 16" stroke="#b97f68" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <circle cx="-12" cy="4" r="15" fill="#f4b89f" />
        <circle cx="12" cy="2" r="16" fill="#f7c7b1" />
        <circle cx="0" cy="-10" r="15" fill="#f6bea6" />
        <circle cx="-3" cy="-2" r="2.4" fill="#e98f7c" />
        <circle cx="11" cy="6" r="2" fill="#e98f7c" />
        <circle cx="-14" cy="10" r="1.8" fill="#e98f7c" />
      </g>

      <path d="M28 96 C36 88 46 90 50 98" stroke="#c99a7f" strokeWidth="1.2" fill="none" opacity="0.7" />
      <Blossom x={40} y={94} size={0.5} petal="#f7c1c6" core="#f8df9f" />
      <Blossom x={146} y={104} size={0.44} petal="#f9d0cf" core="#f8df9f" rotate={16} />
      <Sparkle x={124} y={30} scale={0.36} fill="#e9a98d" />

      <PeachGirl />
    </g>
  );
}

function PeachGirl() {
  return (
    <g transform="translate(88 92)">
      <ellipse cx="0" cy="24" rx="21" ry="4.6" fill="#b97c60" opacity="0.16" />
      <path d="M-11 21 C-14 12 -9 2 0 0 C9 2 14 12 11 21 Z" fill="#f6d9c4" />
      <path d="M-11 21 C-4 24 4 24 11 21 L9 27 L-9 27 Z" fill="#eec3a8" />
      <circle cx="0" cy="-9" r="9.2" fill="#f7c9ae" />
      <path
        d="M-10 -11 C-10 -21 -4 -24 0 -24 C5 -24 10 -21 10 -11 C7 -16 4 -17 0 -14 C-4 -17 -7 -16 -10 -11 Z"
        fill="#6a4436"
      />
      <path d="M-9 -10 C-12 -3 -12 2 -9 6 L-7 -7 Z" fill="#6a4436" />
      <path d="M9 -10 C12 -3 12 2 9 6 L7 -7 Z" fill="#6a4436" />
      <path d="M-5 -7 C-3 -5 -1 -5 1 -7" stroke="#4c3027" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M-1 -7 C1 -5 3 -5 5 -7" stroke="#4c3027" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="-5" cy="-3" r="2.3" fill="#f19a9c" opacity="0.45" />
      <circle cx="5" cy="-3" r="2.3" fill="#f19a9c" opacity="0.45" />
      <Blossom x={8} y={-20} size={0.32} petal="#fff6ef" core="#f3c07f" />
      <path d="M9 6 C14 8 14 13 10 14" stroke="#f7c9ae" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M10 12 L15 15 L15 19 L10 18 Z" fill="#fff7ee" stroke="#e4b28f" strokeWidth="0.7" />
      <path d="M15 12 C18 12 18 18 15 19" fill="none" stroke="#e4b28f" strokeWidth="0.7" />
      <path d="M-6 4 C-8 8 -7 11 -4 12" stroke="#f7c9ae" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Sparkle x={-16} y={-6} scale={0.26} fill="#dc9f82" />
    </g>
  );
}

function MintScene() {
  return (
    <g>
      <circle cx="56" cy="28" r="17" fill="#fff4cf" opacity="0.45" />
      <circle cx="56" cy="28" r="9" fill="#fff0bd" />
      <SoftCloud x={120} y={32} scale={0.5} fill="#fbfffc" opacity={0.9} />
      <SoftCloud x={190} y={48} scale={0.38} fill="#fbfffc" opacity={0.75} />

      <path
        d="M0 80 C30 62 62 66 94 78 C126 90 158 70 190 74 C202 76 212 80 220 84 L220 130 L0 130 Z"
        fill="#cbe6d5"
      />
      <path
        d="M0 100 C40 88 78 96 116 102 C152 108 190 96 220 100 L220 130 L0 130 Z"
        fill="#b3d8c3"
      />
      <ellipse cx="154" cy="111" rx="56" ry="13" fill="#a9d9d3" />
      <ellipse cx="154" cy="109" rx="56" ry="12" fill="#bfe5df" />
      <path d="M124 108 C134 105 144 105 154 108" stroke="#eafaf6" strokeWidth="1.4" fill="none" opacity="0.9" />
      <path d="M164 113 C174 110 184 110 194 113" stroke="#eafaf6" strokeWidth="1.2" fill="none" opacity="0.8" />

      <path
        d="M0 118 C46 112 96 118 144 121 C172 123 198 118 220 117 L220 130 L0 130 Z"
        fill="#e2f2e8"
      />

      <g transform="translate(28 72)">
        <path d="M0 50 C-4 32 -10 18 -18 8" stroke="#7fae90" strokeWidth="1.6" fill="none" />
        <path d="M0 50 C2 30 8 16 18 6" stroke="#7fae90" strokeWidth="1.6" fill="none" />
        <path d="M0 50 C0 32 0 20 0 6" stroke="#7fae90" strokeWidth="1.6" fill="none" />
        <ellipse cx="-14" cy="18" rx="8" ry="3.6" fill="#96c4a8" transform="rotate(-38 -14 18)" />
        <ellipse cx="-18" cy="30" rx="8" ry="3.6" fill="#a5cfb3" transform="rotate(-28 -18 30)" />
        <ellipse cx="15" cy="16" rx="8" ry="3.6" fill="#96c4a8" transform="rotate(36 15 16)" />
        <ellipse cx="18" cy="28" rx="8" ry="3.6" fill="#a5cfb3" transform="rotate(26 18 28)" />
        <ellipse cx="1" cy="8" rx="7" ry="3.2" fill="#a9d3b6" />
      </g>

      <g transform="translate(196 98)">
        <ellipse cx="0" cy="0" rx="10" ry="3.6" fill="#7fb79a" />
        <path d="M-3 -2 L0 -8 L3 -2 Z" fill="#f3b8c8" />
      </g>

      <Blossom x={52} y={108} size={0.46} petal="#f1c6d2" core="#f6e2a8" />
      <Blossom x={70} y={116} size={0.38} petal="#e8d6f2" core="#f6e2a8" rotate={15} />
      <Sparkle x={130} y={24} scale={0.34} fill="#8fbea2" />

      <MintGirl />
    </g>
  );
}

function MintGirl() {
  return (
    <g transform="translate(96 106)">
      <ellipse cx="0" cy="10" rx="30" ry="5" fill="#6f9e83" opacity="0.14" />
      <g transform="rotate(-8)">
        <circle cx="-20" cy="-2" r="8.4" fill="#f6c9ae" />
        <path
          d="M-28 -4 C-29 -13 -23 -17 -19 -17 C-15 -17 -10 -13 -11 -4 C-14 -9 -18 -10 -20 -7 C-23 -10 -26 -9 -28 -4 Z"
          fill="#4c5a4e"
        />
        <path d="M-24 -1 C-22 1 -20 1 -18 -1" stroke="#3f4b42" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M-13 -1 C-11 1 -9 1 -7 -1" stroke="#3f4b42" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M-27 2 C-29 6 -28 9 -25 9" stroke="#f6c9ae" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <path d="M-20 5 C-8 8 8 7 18 4" stroke="#f4d3c0" strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M8 8 C16 9 20 7 24 4 L28 6" stroke="#f6c9ae" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        <path d="M20 4 L24 1 L27 4 L23 7 Z" fill="#f1b7c7" />
        <path d="M-14 -6 C-4 -10 8 -9 16 -4" stroke="#dcefe2" strokeWidth="1" fill="none" opacity="0.8" />
      </g>
      <Sparkle x={14} y={-16} scale={0.24} fill="#84b395" />
    </g>
  );
}

function SkyScene() {
  return (
    <g>
      <SoftCloud x={48} y={28} scale={0.62} fill="#ffffff" opacity={0.92} />
      <SoftCloud x={156} y={22} scale={0.44} fill="#ffffff" opacity={0.82} />
      <path
        d="M130 34 C134 30 140 30 144 34 M148 34 C152 31 157 31 161 34"
        stroke="#8fb3d6"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M0 74 C28 60 56 64 84 72 C112 80 142 64 174 68 C194 70 208 74 220 78 L220 130 L0 130 Z"
        fill="#cfe2f5"
      />
      <path
        d="M0 88 C42 78 82 82 120 88 C158 94 190 82 220 86 L220 130 L0 130 Z"
        fill="#b6d2ec"
      />
      <rect y="96" width="220" height="34" fill="#a9d4ef" />
      <path d="M0 96 C40 92 80 98 120 96 C158 94 190 98 220 96 L220 102 L0 102 Z" fill="#c3e2f6" />
      <path d="M24 110 C34 108 44 108 54 110" stroke="#eaf7ff" strokeWidth="1.4" fill="none" opacity="0.9" />
      <path d="M70 118 C80 116 90 116 100 118" stroke="#eaf7ff" strokeWidth="1.2" fill="none" opacity="0.8" />
      <path d="M152 112 C162 110 172 110 182 112" stroke="#eaf7ff" strokeWidth="1.2" fill="none" opacity="0.8" />

      <g transform="translate(154 96)">
        <path d="M0 0 V-22" stroke="#8e7a86" strokeWidth="1.6" />
        <path d="M1 -22 L12 -14 L1 -10 Z" fill="#fbfaf6" />
        <path d="M0 0 L-10 4 L0 6 L10 4 Z" fill="#b58f7c" />
        <path d="M-10 4 L-4 6 L0 6 L0 4 Z" fill="#a37f6f" />
        <path d="M-16 9 C-8 7 8 7 16 9" stroke="#e5f3fb" strokeWidth="1" fill="none" opacity="0.8" />
      </g>

      <g transform="translate(36 92)">
        <rect x="-4" y="0" width="62" height="5" rx="2.5" fill="#c9a891" />
        <rect x="2" y="5" width="4" height="26" fill="#b3907c" />
        <rect x="48" y="5" width="4" height="26" fill="#b3907c" />
        <rect x="-1" y="4" width="56" height="3" rx="1.5" fill="#d8bda9" />
      </g>

      <g transform="translate(40 92)">
        <circle cx="0" cy="-12" r="8" fill="#f6c9ae" />
        <path
          d="M-9 -13 C-10 -22 -4 -26 0 -26 C5 -26 10 -22 9 -13 C6 -18 2 -19 0 -16 C-3 -19 -7 -18 -9 -13 Z"
          fill="#4c3c4a"
        />
        <path d="M-5 -13 C-3 -11 -1 -11 1 -13" stroke="#3f303c" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M2 -13 C4 -11 6 -11 8 -13" stroke="#3f303c" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M-7 -6 C-8 2 -7 8 -5 12 L5 12 C7 8 8 2 7 -6 Z" fill="#f4d9c6" />
        <path d="M-6 0 C-13 -6 -18 -12 -20 -18" stroke="#f6c9ae" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <path d="M6 0 C13 -4 17 -10 18 -15" stroke="#f6c9ae" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      </g>

      <g transform="translate(196 88)">
        <path d="M0 42 C-2 32 -1 24 0 18" stroke="#7fa98b" strokeWidth="1.4" fill="none" />
        <path d="M0 26 C-7 22 -10 16 -10 10" stroke="#7fa98b" strokeWidth="1.2" fill="none" />
        <path d="M0 32 C7 28 10 22 10 16" stroke="#7fa98b" strokeWidth="1.2" fill="none" />
        <ellipse cx="-1" cy="22" rx="6" ry="2.4" fill="#92b79a" transform="rotate(-56 -1 22)" />
        <ellipse cx="1" cy="28" rx="6" ry="2.4" fill="#a3c4a9" transform="rotate(56 1 28)" />
      </g>
    </g>
  );
}

function RoseScene() {
  return (
    <g>
      <SoftCloud x={58} y={28} scale={0.54} fill="#fffafb" opacity={0.9} />
      <SoftCloud x={184} y={34} scale={0.4} fill="#fffafb" opacity={0.78} />
      <Sparkle x={124} y={22} scale={0.38} fill="#e2aec1" />

      <path
        d="M0 82 C30 68 62 72 92 82 C124 92 154 74 184 78 C198 80 210 84 220 88 L220 130 L0 130 Z"
        fill="#f6d4df"
      />
      <path
        d="M0 102 C42 90 80 96 118 104 C154 112 190 98 220 102 L220 130 L0 130 Z"
        fill="#eebfce"
      />
      <path
        d="M0 118 C50 110 102 118 152 121 C178 123 202 117 220 116 L220 130 L0 130 Z"
        fill="#fbe6ec"
      />

      <g transform="translate(172 60)">
        <path d="M2 50 C1 38 1 24 2 10" stroke="#b3838f" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M2 28 C-7 20 -14 18 -22 18" stroke="#b3838f" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M3 22 C11 14 18 12 26 12" stroke="#b3838f" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="-14" cy="8" r="15" fill="#f3b9cc" opacity="0.95" />
        <circle cx="14" cy="4" r="16" fill="#f7c9d8" opacity="0.95" />
        <circle cx="0" cy="-8" r="15" fill="#f4bfd1" />
        <circle cx="-22" cy="18" r="10" fill="#f6c4d4" />
        <circle cx="26" cy="14" r="9" fill="#f0b3c7" />
        <circle cx="-6" cy="4" r="2.2" fill="#e598b1" />
        <circle cx="12" cy="-2" r="2" fill="#e598b1" />
        <circle cx="18" cy="14" r="1.8" fill="#e598b1" />
      </g>

      <g transform="translate(30 74)">
        <path d="M0 46 C-3 34 -2 24 0 16" stroke="#a9c7a6" strokeWidth="1.4" fill="none" />
        <path d="M0 30 C-7 26 -10 20 -10 14" stroke="#a9c7a6" strokeWidth="1.2" fill="none" />
        <ellipse cx="-2" cy="24" rx="6" ry="2.4" fill="#b3cdb0" transform="rotate(-52 -2 24)" />
        <ellipse cx="1" cy="32" rx="6" ry="2.4" fill="#c2d8be" transform="rotate(52 1 32)" />
      </g>

      <Blossom x={44} y={104} size={0.5} petal="#f6bccd" core="#f6e2a8" />
      <Blossom x={62} y={112} size={0.4} petal="#fbd4e0" core="#f6e2a8" rotate={17} />
      <path
        d="M118 26 C120 30 118 33 115 34"
        stroke="#e8a7bb"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="114" cy="36" rx="2" ry="3.4" fill="#e8a7bb" opacity="0.8" />
      <ellipse cx="152" cy="46" rx="1.8" ry="3" fill="#eeb2c4" opacity="0.7" />

      <RoseGirl />
    </g>
  );
}

function RoseGirl() {
  return (
    <g transform="translate(86 96)">
      <ellipse cx="0" cy="26" rx="24" ry="5.4" fill="#b37488" opacity="0.16" />
      <ellipse cx="0" cy="23" rx="17" ry="5" fill="#f3cdd8" />
      <path d="M-11 22 C-14 12 -9 2 0 0 C9 2 14 12 11 22 Z" fill="#f8e2d5" />
      <path d="M-11 21 C-6 24 6 24 11 21 L12 25 L-12 25 Z" fill="#f3cfc1" />
      <circle cx="0" cy="-9" r="9.4" fill="#f6c5ae" />
      <path
        d="M-10 -11 C-11 -21 -4 -25 0 -25 C5 -25 11 -21 10 -11 C7 -16 3 -17 0 -14 C-4 -17 -7 -16 -10 -11 Z"
        fill="#6a4652"
      />
      <path d="M-10 -11 C-14 -4 -13 3 -10 7 L-8 -8 Z" fill="#6a4652" />
      <path d="M10 -11 C14 -4 13 3 10 7 L8 -8 Z" fill="#6a4652" />
      <path d="M-5 -7 C-3 -5 -1 -5 1 -7" stroke="#4d323c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M-1 -7 C1 -5 3 -5 5 -7" stroke="#4d323c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M-2 -3 C0 -1 2 -1 4 -3" stroke="#bd6f7c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="-5" cy="-3" r="2.4" fill="#f19a9c" opacity="0.45" />
      <circle cx="5" cy="-3" r="2.4" fill="#f19a9c" opacity="0.45" />
      <Blossom x={-9} y={-21} size={0.32} petal="#f7c3d2" core="#f6e2a8" />
      <Blossom x={-2} y={-24} size={0.27} petal="#fbd8e2" core="#f6e2a8" rotate={20} />
      <path d="M-6 6 C-9 10 -10 15 -7 18" stroke="#f6c5ae" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M6 6 C8 10 8 14 5 17" stroke="#f6c5ae" strokeWidth="4" strokeLinecap="round" fill="none" />
      <g transform="translate(0 14)">
        <path d="M0 -6 C-4 -2 -4 2 0 5 C4 2 4 -2 0 -6 Z" fill="#e78fa9" />
        <path d="M0 5 L0 10" stroke="#a9c7a6" strokeWidth="1.2" />
        <path d="M0 0 C-2 2 -2 4 0 5 C2 4 2 2 0 0 Z" fill="#f7c0d1" />
      </g>
      <Sparkle x={15} y={-6} scale={0.26} fill="#df9db2" />
    </g>
  );
}
