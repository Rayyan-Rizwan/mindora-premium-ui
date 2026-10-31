import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Field, Input } from "@/components/ui";
import {
  AppleIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
} from "@/components/ui/icons";
import { describeApiError } from "@/lib/errors";
import { useAuth } from "@/hooks/useAuth";
import { fetchSetupStatus } from "@/api/users";
import { fetchAssessmentStatus } from "@/api/assessment";
import { AuthShell } from "./AuthShell";
import { DemoEntry } from "@/components/demo/DemoEntry";

export default function LoginPage() {
  const { signIn, sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [socialNotice, setSocialNotice] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    clearSessionExpired();
    setError("");
    setNeedsVerification(false);
    setSocialNotice("");
    setSubmitting(true);

    try {
      const user = await signIn(email.trim(), password);

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }
      if (user.role === "professional") {
        navigate("/appointments", { replace: true });
        return;
      }

      const setup = await fetchSetupStatus();
      if (!setup.profile_completed) {
        navigate("/onboarding", { replace: true });
        return;
      }

      const assessment = await fetchAssessmentStatus();
      if (!assessment.completed) {
        navigate("/assessment", { replace: true });
        return;
      }

      const requested = (location.state as { from?: string } | null)?.from;
      navigate(requested && requested.startsWith("/") ? requested : "/dashboard", {
        replace: true,
      });
    } catch (loginError) {
      const info = describeApiError(loginError);
      if (info.status === 403) {
        if (/verify/i.test(info.message)) {
          setNeedsVerification(true);
          setError(
            "Your email hasn’t been verified yet. Open the verification link we emailed you, then sign in again.",
          );
        } else {
          setError(info.message);
        }
      } else if (info.status === 401) {
        setError("That email and password don’t match. Please try again.");
      } else {
        setError(info.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Take a deep breath. You’re here, and that’s a big step."
      footer={
        <p>
          Don’t have an account? <Link to="/register">Sign up</Link>
        </p>
      }
    >
      {sessionExpired ? (
        <Alert tone="warning">
          Your session expired for security. Please sign in again.
        </Alert>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Field label="Email" htmlFor="login-email">
          <div className="auth-input">
            <MailIcon size={18} className="auth-input__icon" />
            <Input
              id="login-email"
              className="auth-input__field"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="login-password">
          <div className="auth-input">
            <LockIcon size={18} className="auth-input__icon" />
            <Input
              id="login-password"
              className="auth-input__field"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              required
            />
            <button
              type="button"
              className="auth-input__action"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
        </Field>

        <div className="auth-form__between">
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        {error ? (
          <Alert tone="danger">
            <p>{error}</p>
            {needsVerification && email ? (
              <Link to={`/check-email?email=${encodeURIComponent(email)}`}>
                Open the verification instructions
              </Link>
            ) : null}
          </Alert>
        ) : null}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={submitting}
          disabled={!email.trim() || !password}
          className="auth-submit"
        >
          <span>{submitting ? "Signing in…" : "Login"}</span>
          <ArrowRightIcon size={18} />
        </Button>
      </form>

      <div className="auth-divider" role="separator" aria-label="or continue with">
        <span>or continue with</span>
      </div>

      <div className="auth-social">
        <button
          type="button"
          className="auth-social__button"
          onClick={() =>
            setSocialNotice(
              "Google sign-in isn’t connected in this build yet. Use your email and password, or open the demo preview below.",
            )
          }
        >
          <GoogleIcon size={19} />
          <span>Google</span>
        </button>
        <button
          type="button"
          className="auth-social__button"
          onClick={() =>
            setSocialNotice(
              "Apple sign-in isn’t connected in this build yet. Use your email and password, or open the demo preview below.",
            )
          }
        >
          <AppleIcon size={19} />
          <span>Apple</span>
        </button>
      </div>

      {socialNotice ? <Alert tone="info">{socialNotice}</Alert> : null}

      <details className="auth-demo">
        <summary>Just want to look around?</summary>
        <DemoEntry />
      </details>
    </AuthShell>
  );
}
