import { Link, useSearchParams } from "react-router-dom";
import { AuthShell } from "./AuthShell";
import { Alert } from "@/components/ui";

export default function CheckEmailPage() {
  const [params] = useSearchParams();
  const email = params.get("email");

  return (
    <AuthShell
      title="Check your inbox"
      subtitle="One small step to keep your space safe."
      footer={
        <p>
          Already verified? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <div className="check-email">
        <div className="check-email__icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="6" y="11" width="36" height="27" rx="7" stroke="currentColor" strokeWidth="2" />
            <path d="m9 15 13.4 10.2a2.8 2.8 0 0 0 3.2 0L39 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p>
          We sent a verification link
          {email ? (
            <>
              {" "}
              to <strong>{email}</strong>
            </>
          ) : (
            " to your email address"
          )}
          . Open it to activate your account, then sign in.
        </p>
        <Alert tone="info">
          The link is single-use and expires. If the email hasn’t arrived after
          a few minutes, check your spam folder. The existing backend does not
          expose a resend endpoint, so no resend button is shown here.
        </Alert>
      </div>
    </AuthShell>
  );
}
