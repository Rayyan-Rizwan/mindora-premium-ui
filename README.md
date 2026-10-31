# Mindora Premium UI

A standalone, meditation-inspired interface for the existing **Mindora —
AI-Powered Psychology & Mental Wellness Platform** final-year project.

This project is independent of the protected FYP source tree. It reuses the
existing FastAPI contracts but has its own Vite build, styling, components, and
tests. No backend file was modified.

## Quick start

```bash
cd mindora-premium-ui
npm install
npm run dev
```

Open `http://localhost:5173`.

The development server proxies `/api` to `http://127.0.0.1:8000` so local work
does not depend on the backend CORS allowlist. The target backend itself is not
changed.

## Demo Mode (development only)

`npm run dev` builds the demo. There are two entry points:

- The landing page shows a **Dev preview** strip with a role picker and
  **Open demo**.
- `/login` shows a **Demo mode** panel below the normal form with **Enter demo**.

Pick **Member**, **Professional**, or **Admin** to open that role's screens with
synthetic sample data. While the demo is active, a sticky banner shows the
current role, allows switching, and offers **Exit demo**, which returns to
`/login` and clears the role. The role is kept in `sessionStorage`, so reloading
keeps the demo but closing the tab ends it. No account, password, email
verification, token, or backend request is involved; all responses come from an
in-file Axios adapter.

The demo is compiled out of production: the mock module graph is only imported
from an `import.meta.env.DEV` branch in `src/main.tsx`, and the adapter is only
installed when `DEV` is true. A production build contains no demo fixtures,
demo user names, conversation text, or `sessionStorage` key. Normal sign-up,
sign-in, and verification code paths are unchanged.

Everything a demo screen reports is simulated: chat replies are scripted
samples, appointments and admin actions mutate only in-memory/browser data, the
assessment result is a fixed sample, and mood/professional/admin records are
fixtures. Demo screens carry visible notes saying so. No protected FYP backend,
database, credential, or migration is touched.

### Production API configuration

```text
VITE_API_BASE_URL=https://<backend-host>/api/v1
```

If the variable is empty, the app uses `/api/v1` relative to the frontend host.
For a deployed frontend, the backend must allow that origin via `CORS_ORIGINS`,
and `FRONTEND_URL` must match the deployed frontend so verification and reset
emails point to the right place. Those backend settings were not changed here.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite development server with `/api` proxy |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript project check |
| `npm run lint` | ESLint |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest watch mode |

## Routes

| Route | Access | Screen |
| --- | --- | --- |
| `/` | Public | Landing |
| `/login`, `/register` | Guests | Sign in / create account |
| `/check-email`, `/verify-email` | Public | Verification flow |
| `/forgot-password`, `/reset-password` | Public | Password reset |
| `/onboarding` | User | Profile setup |
| `/dashboard` | User | Wellness home |
| `/chat` | User | Companion chat, conversation archive |
| `/mood` | User | Daily check-in and trend |
| `/assessment` | User | 15-question screening |
| `/relax` | User | Relax hub |
| `/relax/breathing` | User | Guided breathing exercise |
| `/relax/player`, `/listen` | User | Generated ambient pieces and mini-player |
| `/professionals` | User | Verified professional directory and booking |
| `/appointments` | User, professional | Appointments and status actions |
| `/notifications` | Signed in | Notification list |
| `/settings` | Signed in | Profile, account, security, companion, and appearance |
| `/admin` | Admin | Operations overview |
| `/admin/knowledge-base` | Admin | Knowledge library |
| `/library` | Admin | Redirects to `/admin/knowledge-base` |
| `/admin/users` | Admin | User flags and roles |
| `/admin/appointments` | Admin | Confirm, cancel, meeting links |
| `/admin/applications` | Admin | Professional application review |
| `/admin/reports` | Admin | 1–90 day operations report |
| `/admin/broadcast` | Admin | Compose, preview, and confirm an in-app broadcast |
| `*` | Public | 404 recovery page |

Client guards control presentation only; authorization decisions remain
server-side.

## Structure

```text
src/
  app/                 route tree and role-aware redirects
  api/                 Axios client and typed endpoint wrappers
  components/
    avatar/            companion 3D canvas, error boundary, illustrated fallback
    layout/            app shell, sidebar, topbar, notifications, guards
    ui/                buttons, fields, cards, modal, chart, icons
  features/
    auth/              landing, sign-in, registration, verification, reset, onboarding
    dashboard/         wellness home
    chat/              chat workspace and voice mode overlay
    relax/             generated ambient player, track list, mini-player
    mood/              daily mood check-in
    assessment/        intro, runner, results
    appointments/      professionals, booking, appointments
    notifications/     notification list
    settings/          profile and preferences
    admin/             overview, users, appointments, applications, reports, broadcast
  hooks/               auth, theme, companion, reduced motion, WebGL support
  lib/                 dates, errors, mood copy, theme, companion, timezones, utils
  styles/              design tokens, base, layout, feature and responsive CSS
  test/                Vitest setup and tests
  types/               shared API types
```

## Design system

- **Palette**: five pastel palettes — lavender, peach, mint, sky, and rose —
  each with a light and a dark mode. Shared semantic tokens drive every screen.
- **Surfaces**: rounded layered cards, soft shadows, blurred glass panels,
  restrained ambient gradients.
- **Type**: Fraunces variable display face with italic accents for landing,
  auth, hero and page titles; Plus Jakarta Sans variable for UI text. Both are
  bundled locally and do not depend on a third-party font CDN.
- **CSS**: hand-written custom properties and feature styles, ordered through
  `src/styles/index.css`. No utility framework.
- **Responsive**: breakpoints at 1180, 1024, 960, 720, 560, 400, and 360 px; mobile
  drawer, bottom navigation for member screens, off-canvas chat history, and
  single-column layouts. Admin tables become stacked cards at ≤1024 px so no
  table scrolls sideways.
- **Accessibility**: semantic landmarks, visible focus rings, labelled fields
  and icon buttons, live regions for chat/loading state, reduced-motion
  handling, and a non-WebGL companion fallback.

## Appearance and themes

- Five colour palettes and a light/dark mode are stored in this browser under
  `mindora_theme` and `mindora_mode`, applied through `data-theme` and
  `data-mode`, and kept in sync with a `mindora:theme-change` event.
- A small pre-paint script applies the saved values before React mounts so a
  reload does not flash the wrong theme.
- The picker lives in **Profile & settings → Make Mindora yours**; **Reset**
  returns to the default lavender light palette. Theme choice is a local
  interface preference and is not saved to the account.
- Reduced motion follows the operating system/browser setting and disables the
  ambient animations and the 3D companion in favour of the static illustration.

## Companion characters

`CompanionAvatar` is reused across landing, auth, dashboard, chat, voice mode,
and the 404 page. It supports `idle`, `listening`, `thinking`, `responding`,
`encouraging`, and `error` states.

Three characters share the same illustrated and 3D rig, each with its own
palette and accessory:

| Character | Trait | Look |
| --- | --- | --- |
| Lumi | Gentle | Lavender with a swaying sprout |
| Momo | Steady | Warm apricot with round ears |
| Pip | Playful | Mint with a small star |

- The choice is made in **Profile & settings → Who sits with you**, with
  previews, labels, an active check, **Reset**, and live idle motion.
- It is stored in this browser under `mindora_companion`, mirrored through a
  `mindora:companion-change` event, and applied before the page paints. The
  selected name replaces “Lumi” throughout the signed-in dashboard, chat, voice
  overlay, assessment, mood, notifications, and settings copy. Pre-auth screens
  keep the Lumi brand.
- It is a presentation preference only. Changing it does not touch assessments,
  mood records, appointments, or care, and the UI says so.
- The 3D scene is procedural React Three Fiber/three.js, lazy-loaded and wrapped
  in Suspense plus an error boundary.
- A static SVG illustration is used when WebGL is unavailable, the visitor
  prefers reduced motion, or the canvas fails.
- The companion is decorative and marked as an image with an accessible state
  label; it is non-interactive and does not sit over chat controls. It floats
  above the composer rather than covering it.
- The 3D chunk is ~827 kB (222 kB gzip), loaded only when needed.

## Voice mode, broadcast, and Relax & Listen

- **Chat voice mode** — a floating companion button on `/chat` opens a full-screen
  overlay with listening, thinking, speaking, and idle/error states. Speech
  input uses the browser's SpeechRecognition API; the recognised text is sent
  through the existing `POST /chat` path, and the assistant reply is read with
  `speechSynthesis`. It is a turn-by-turn conversation, not live audio
  streaming. When speech APIs are missing or permission is denied, the overlay
  explains the limitation and text chat remains available.
- **Broadcast notifications** (`/admin/broadcast`) — admin-only compose form
  with title/message limits, audience modes (everyone, by role, specific
  people), a server preview that resolves active recipients, and a confirmation
  step before sending. It calls `POST /admin/content/broadcast/preview` and
  `POST /admin/content/broadcast`; a 409 duplicate response offers an explicit
  "send anyway" path. Delivery is in-app only and requires a real backend; in
  demo mode both calls are simulated and labelled as such.
- **Listen** (`/listen`, also `/relax/player`) — nine original instrumental pieces generated at
  runtime with the Web Audio API (oscillators, filtered noise, slow envelopes).
  No audio files are downloaded or streamed. Category filters, per-track
  play/pause/stop, progress, volume, and a mini-player that stays available
  while the member browses other screens. Browsers without Web Audio see clearly
  marked non-playable cards. Nothing here is presented as treatment or medical
  care.

## Data honesty

The UI renders only values returned by the backend. It does not invent
appointments, mood entries, assessment results, analytics, or notifications.
Broadcast recipient counts come from the server preview, and a send is only
reported as delivered when the API returns its result; demo mode labels its
simulated previews and sends. Unavailable features (journal, streaming chat,
push/email/SMS notifications, automatic meeting links, in-app password change)
are not faked. Empty, loading, error, and permission states are explicit.

## Documentation

Internal audit, API mapping, limitations, and test-report notes are kept
locally and are not published in this repository.

## Status

Typecheck, lint, 67 automated tests in 12 files, and the production build pass.
The full signed-in UI was exercised in headless Chrome with the dev demo session
at 320, 360, 390, 430, 768, 1024, and 1440 px: landing, auth, dashboard, chat
(including the welcome state, history drawer, and voice overlay), mood,
assessment, relax, professionals, appointments, notifications, settings, every
admin page, 404, and dark mode. Across those runs the document
`scrollWidth` matched the viewport on every route and width, admin tables no
longer scrolled sideways at 1024/768 px, and no console errors were recorded.
Direct deep links, reloads, and browser back/forward navigation were checked.
**No live backend integration test has been run**; the backend was intentionally
never started from this project, so no broadcast was actually delivered to a
real inbox. Headless Chrome cannot confirm that audio is audible, and real
microphone/speech behaviour was not exercised. See the project's local
limitations notes for the exact unverified areas.
