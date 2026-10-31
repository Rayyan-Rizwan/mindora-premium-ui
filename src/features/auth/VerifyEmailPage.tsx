import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/api/auth";
import { getApiErrorMessage } from "@/lib/errors";
import { AuthShell } from "./AuthShell";
import { Alert, Spinner } from "@/components/ui";

type State =
  | { status: "verifying" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>(
    token ? { status: "verifying" } : {
      status: "error",
      message: "This verification link is missing its token.",
    },
  );
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    let cancelled = false;

    const run = async () => {
      try {
        const result = await verifyEmail(token);
        if (!cancelled) {
          setState({ status: "success", message: result.message });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: getApiErrorMessage(
              error,
              "This verification link is invalid or has expired.",
            ),
          });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthShell
      title={
        state.status === "success"
          ? "You’re verified"
          : state.status === "error"
            ? "We couldn’t verify that link"
            : "Verifying your email"
      }
      subtitle="A quiet moment while we confirm your account."
      footer={
        state.status === "success" ? (
          <p>
            <Link to="/login">Continue to sign in</Link>
          </p>
        ) : (
          <p>
            <Link to="/login">Back to sign in</Link>
          </p>
        )
      }
    >
      {state.status === "verifying" ? (
        <div className="verify-state" role="status">
          <Spinner size={24} />
          <p>Checking your verification link…</p>
        </div>
      ) : state.status === "success" ? (
        <Alert tone="success">{state.message}</Alert>
      ) : (
        <Alert tone="danger">{state.message}</Alert>
      )}
    </AuthShell>
  );
}
