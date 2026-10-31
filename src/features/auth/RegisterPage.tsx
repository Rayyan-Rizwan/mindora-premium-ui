import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Field, Input } from "@/components/ui";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "@/components/ui/icons";
import { describeApiError } from "@/lib/errors";
import { register } from "@/api/auth";
import { AuthShell } from "./AuthShell";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) nextErrors.fullName = "Please tell us your name.";
    if (!email.trim()) nextErrors.email = "Please add your email.";
    if (password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords don’t match.";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setError("");
    setSubmitting(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      navigate(`/check-email?email=${encodeURIComponent(email.trim())}`, {
        replace: true,
      });
    } catch (registerError) {
      const info = describeApiError(registerError);
      if (info.status === 409) {
        setError("An account already exists for that email. Try signing in.");
      } else {
        setError(info.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create Your Account"
      subtitle="A kinder mind, a brighter you."
      className="auth-v2--signup"
      peek
      footer={
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Field label="Full name" htmlFor="register-name" error={fieldErrors.fullName}>
          <div className="auth-input">
            <UserIcon size={18} className="auth-input__icon" />
            <Input
              id="register-name"
              className="auth-input__field"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="How should we greet you?"
              required
              autoFocus
            />
          </div>
        </Field>

        <Field label="Email" htmlFor="register-email" error={fieldErrors.email}>
          <div className="auth-input">
            <MailIcon size={18} className="auth-input__icon" />
            <Input
              id="register-email"
              className="auth-input__field"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        </Field>

        <Field
          label="Password"
          htmlFor="register-password"
          hint="At least 8 characters."
          error={fieldErrors.password}
        >
          <div className="auth-input">
            <LockIcon size={18} className="auth-input__icon" />
            <Input
              id="register-password"
              className="auth-input__field"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Choose a password"
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

        <Field
          label="Confirm password"
          htmlFor="register-confirm"
          error={fieldErrors.confirmPassword}
        >
          <div className="auth-input">
            <LockIcon size={18} className="auth-input__icon" />
            <Input
              id="register-confirm"
              className="auth-input__field"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              required
            />
            <button
              type="button"
              className="auth-input__action"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={
                showConfirmPassword
                  ? "Hide password confirmation"
                  : "Show password confirmation"
              }
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? (
                <EyeOffIcon size={18} />
              ) : (
                <EyeIcon size={18} />
              )}
            </button>
          </div>
        </Field>

        {error ? <Alert tone="danger">{error}</Alert> : null}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={submitting}
          disabled={!fullName || !email || !password || !confirmPassword}
          className="auth-submit"
        >
          <span>{submitting ? "Creating your account…" : "Create account"}</span>
          <ArrowRightIcon size={18} />
        </Button>

        <p className="auth-form__legal">
          Mindora offers supportive wellbeing guidance, not a substitute for
          professional or emergency care. Your details stay private to your
          account.
        </p>
      </form>
    </AuthShell>
  );
}
