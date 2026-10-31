import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { updateMe, fetchSetupStatus } from "@/api/users";
import { fetchAssessmentStatus } from "@/api/assessment";
import { describeApiError } from "@/lib/errors";
import { useAuth } from "@/hooks/useAuth";
import { CompanionAvatar } from "@/components/avatar/CompanionAvatar";
import { Logo } from "@/components/layout/Logo";
import { DEFAULT_TIMEZONE, TIMEZONES } from "@/lib/timezones";
import { Alert, Button, Field, Input, Select } from "@/components/ui";

export default function OnboardingPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.profile?.phone ?? "");
  const [timezone, setTimezone] = useState(
    user?.profile?.timezone ?? DEFAULT_TIMEZONE,
  );
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const setup = await fetchSetupStatus();
        if (cancelled) return;
        if (setup.profile_completed) {
          const assessment = await fetchAssessmentStatus();
          if (cancelled) return;
          navigate(assessment.completed ? "/dashboard" : "/assessment", {
            replace: true,
          });
          return;
        }
      } catch (statusError) {
        console.error("Could not read onboarding status", statusError);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || !fullName.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const updated = await updateMe({
        full_name: fullName.trim(),
        phone: phone.trim(),
        timezone,
      });
      setUser(updated);

      const assessment = await fetchAssessmentStatus();
      navigate(assessment.completed ? "/dashboard" : "/assessment", {
        replace: true,
      });
    } catch (saveError) {
      setError(describeApiError(saveError).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="route-loading" role="status">
        <span>Preparing your welcome…</span>
      </div>
    );
  }

  return (
    <div className="onboarding">
      <div className="onboarding__visual">
        <div className="auth-orbs" aria-hidden="true">
          <span className="auth-orb auth-orb--one" />
          <span className="auth-orb auth-orb--two" />
          <span className="auth-orb auth-orb--three" />
        </div>
        <Logo to="/" />
        <div className="onboarding__steps">
          <p className="eyebrow">Your first steps</p>
          <ol>
            <li className="is-current">
              <span>01</span>
              <div>
                <strong>A little about you</strong>
                <p>Just your name, and optionally a phone number.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>A short wellness check</strong>
                <p>15 gentle questions. Nothing is a diagnosis.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Meet Lumi</strong>
                <p>Your companion for everyday support.</p>
              </div>
            </li>
          </ol>
        </div>
        <div className="onboarding__companion">
          <CompanionAvatar state="encouraging" size="lg" />
          <p className="onboarding__quote">
            “No rush. We’ll go at your pace.”
          </p>
        </div>
      </div>

      <main className="onboarding__panel">
        <div className="onboarding__card">
          <header>
            <div className="onboarding__mobile-companion">
              <CompanionAvatar state="idle" size="sm" />
            </div>
            <p className="eyebrow">Step 1 of 3</p>
            <h1>Welcome{user ? `, ${user.full_name.split(" ")[0]}` : ""}</h1>
            <p>
              A few details help Mindora feel like your space. Your email is
              already verified and stays private.
            </p>
            <div className="onboarding-progress" aria-hidden="true">
              <span className="is-active" />
              <span />
              <span />
            </div>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <Field label="Full name" htmlFor="onboarding-name">
              <Input
                id="onboarding-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                required
              />
            </Field>

            <Field
              label="Phone number"
              htmlFor="onboarding-phone"
              optional
              hint="Used only for your profile. Nothing is sent to it by this UI."
            >
              <Input
                id="onboarding-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+92 300 1234567"
                autoComplete="tel"
              />
            </Field>

            <Field
              label="Timezone"
              htmlFor="onboarding-timezone"
              hint="Used for appointment times and reminders."
            >
              <Select
                id="onboarding-timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
              >
                {TIMEZONES.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Email" htmlFor="onboarding-email">
              <Input
                id="onboarding-email"
                value={user?.email ?? ""}
                disabled
              />
            </Field>

            {error ? <Alert tone="danger">{error}</Alert> : null}

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={!fullName.trim()}
            >
              {submitting ? "Saving…" : "Continue to the assessment"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
