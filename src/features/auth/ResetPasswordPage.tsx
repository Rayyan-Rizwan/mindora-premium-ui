import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "@/api/auth";
import { describeApiError } from "@/lib/errors";
import { AuthShell } from "./AuthShell";
import { Alert, Button, Field, Input } from "@/components/ui";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don’t match.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (resetError) {
      setError(
        describeApiError(
          resetError,
          "This reset link is invalid or has expired.",
        ).message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="A fresh start, with the same private space."
      footer={
        <p>
          <Link to="/login">Back to sign in</Link>
        </p>
      }
    >
      {!token ? (
        <Alert tone="danger">
          This reset link is missing its token. Request a new link from the
          forgot-password page.
        </Alert>
      ) : success ? (
        <div className="stack">
          <Alert tone="success">
            Your password has been updated. You can now sign in.
          </Alert>
          <Link to="/login" className="btn btn--primary btn--lg btn--full">
            <span>Continue to sign in</span>
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field
            label="New password"
            htmlFor="reset-password"
            hint="At least 8 characters."
          >
            <div className="input-with-action">
              <Input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoFocus
              />
              <button
                type="button"
                className="input-with-action__button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          <Field label="Confirm new password" htmlFor="reset-confirm">
            <div className="input-with-action">
              <Input
                id="reset-confirm"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
              />
              <button
                type="button"
                className="input-with-action__button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={
                  showConfirmPassword
                    ? "Hide password confirmation"
                    : "Show password confirmation"
                }
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          {error ? <Alert tone="danger">{error}</Alert> : null}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!password || !confirm}
          >
            {submitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
