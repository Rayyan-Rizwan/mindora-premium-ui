import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "@/api/auth";
import { describeApiError } from "@/lib/errors";
import { AuthShell } from "./AuthShell";
import { Alert, Button, Field, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || !email.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (requestError) {
      // The endpoint is intentionally generic; a network error is the only
      // realistic failure worth surfacing.
      const info = describeApiError(requestError);
      setError(info.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we’ll send a single-use reset link."
      footer={
        <p>
          Remembered it? <Link to="/login">Back to sign in</Link>
        </p>
      }
    >
      {sent ? (
        <div className="stack">
          <Alert tone="success">
            If an account exists for {email}, a reset link is on its way. The
            same message is shown for every address so accounts stay private.
          </Alert>
          <p className="muted">
            Follow the link in the email to choose a new password. The reset link
            is time-limited.
          </p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field
            label="Email"
            htmlFor="forgot-email"
            hint="We’ll only send a link if this address belongs to an account."
          >
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </Field>

          {error ? <Alert tone="danger">{error}</Alert> : null}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!email.trim()}
          >
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
