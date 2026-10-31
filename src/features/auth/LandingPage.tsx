import { Link } from "react-router-dom";
import { CompanionAvatar } from "@/components/avatar/CompanionAvatar";
import { Logo } from "@/components/layout/Logo";
import { DemoEntry } from "@/components/demo/DemoEntry";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChatIcon,
  LeafIcon,
  MoodIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/ui/icons";

const FEATURES = [
  {
    icon: ChatIcon,
    title: "An AI companion",
    body: "Talk things through with Mindora’s existing Mistral-powered companion, which can draw on its psychology knowledge base when relevant.",
  },
  {
    icon: MoodIcon,
    title: "Daily mood check-ins",
    body: "Log a 1–10 mood with an optional note. One entry per day; update it whenever the day shifts.",
  },
  {
    icon: SparkIcon,
    title: "Gentle screening",
    body: "A 15-question wellbeing assessment built from WHO-5 and GAD-7 screening items, with clear, non-diagnostic interpretation.",
  },
  {
    icon: CalendarIcon,
    title: "Human support",
    body: "Browse verified professionals and manage appointments within the same calm space.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const primaryHref = user ? "/dashboard" : "/register";
  const primaryLabel = user ? "Open your space" : "Create your space";

  return (
    <div className="landing">
      <div className="landing__ambient" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className="landing__header">
        <Logo />
        <nav className="landing__nav" aria-label="Landing">
          <a href="#inside">What’s inside</a>
          <a href="#how">How it works</a>
          <a href="#safety">Safety</a>
        </nav>
        <div className="landing__actions">
          {user ? (
            <Link to={primaryHref} className="btn btn--primary btn--sm">
              <span>{primaryLabel}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-button">
                Sign in
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
                <span>Get started</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {!user ? <DemoEntry variant="strip" /> : null}

      <main>
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">
              <LeafIcon size={15} /> A gentler everyday companion
            </p>
            <h1>
              A softer place to land,
              <em> every day.</em>
            </h1>
            <p className="hero__lede">
              Mindora brings a warm AI companion, honest mood tracking and
              non-diagnostic wellbeing screening into one calm, private space.
            </p>
            <div className="hero__actions">
              <Link to={primaryHref} className="btn btn--primary btn--lg">
                <span>{primaryLabel}</span>
                <ArrowRightIcon size={18} />
              </Link>
              <a href="#inside" className="btn btn--secondary btn--lg">
                <span>Explore the experience</span>
              </a>
            </div>
            <div className="hero__trust">
              <ShieldIcon size={17} />
              <span>
                Your check-ins are tied to your account. Mindora is supportive
                care — not a diagnosis or emergency service.
              </span>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__halo" aria-hidden="true" />
            <div className="hero__companion-card">
              <div className="hero__companion-top">
                <span className="hero__companion-name">
                  <span className="hero__status-dot" aria-hidden="true" />
                  Lumi
                </span>
                <span className="hero__companion-state">Here with you</span>
              </div>
              <CompanionAvatar state="encouraging" size="hero" />
              <div className="hero__chips">
                <span>Here to listen</span>
                <span>Private to you</span>
                <span>Never a diagnosis</span>
              </div>
            </div>

            <div className="hero__float hero__float--mood" aria-hidden="true">
              <MoodIcon size={18} />
              <div>
                <strong>Daily check-in</strong>
                <span>A 1–10 moment for yourself</span>
              </div>
            </div>
            <div className="hero__float hero__float--calm" aria-hidden="true">
              <LeafIcon size={18} />
              <div>
                <strong>At your pace</strong>
                <span>No streaks to chase</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="inside">
          <div className="section__intro">
            <p className="eyebrow">What’s inside</p>
            <h2>Care that meets you where you are.</h2>
            <p>
              Every surface is connected to Mindora’s existing backend. No
              invented records, no decorative controls.
            </p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="feature-card" key={feature.title}>
                  <span className="feature-card__icon">
                    <Icon size={22} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section section--split" id="how">
          <div className="section__intro">
            <p className="eyebrow">How it works</p>
            <h2>Three quiet steps, then it’s yours.</h2>
            <p>
              Verify your email, tell us how to greet you, and complete the
              initial assessment. From there, everything is optional and
              revisitable.
            </p>
            <Link to={primaryHref} className="text-button text-button--arrow">
              Begin whenever you’re ready <ArrowRightIcon size={16} />
            </Link>
          </div>
          <ol className="steps">
            <li>
              <span>01</span>
              <div>
                <h3>Create and verify</h3>
                <p>A verified email keeps your account and history private.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Meet your baseline</h3>
                <p>
                  The screening assessment shows where support may help — never
                  a label or diagnosis.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Check in, or don’t</h3>
                <p>
                  Chat with Lumi, log a mood, revisit your trend, or book time
                  with a professional.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="safety-band" id="safety">
          <div className="safety-band__icon">
            <ShieldIcon size={26} />
          </div>
          <div>
            <h2>A note on safety</h2>
            <p>
              Mindora provides general emotional support and screening
              information. It does not diagnose conditions, prescribe treatment
              or replace a qualified professional. If you are in immediate
              danger, contact your local emergency service or go to the nearest
              emergency department. The AI companion also has its own existing
              safety responses for messages that suggest risk.
            </p>
          </div>
        </section>
      </main>

      <footer className="landing__footer">
        <Logo />
        <p>
          Mindora — a final-year project exploring AI-supported mental
          wellbeing.
        </p>
        <div>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Create an account</Link>
        </div>
      </footer>
    </div>
  );
}
