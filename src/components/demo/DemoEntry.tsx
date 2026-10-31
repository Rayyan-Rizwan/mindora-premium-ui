import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { SparkIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import {
  DEMO_ROLES,
  demoHomeFor,
  isDemoAvailable,
  type DemoRole,
} from "@/demo/demoSession";

const ROLE_HINTS: Record<DemoRole, string> = {
  user: "dashboard & check-ins",
  professional: "practice view",
  admin: "operations & reports",
};

/**
 * Entry point for the sample workspace. It is rendered in every build whenever
 * a demo role can be started; `isDemoAvailable()` keeps it in sync with the
 * session layer.
 */
export function DemoEntry({ variant = "panel" }: { variant?: "panel" | "strip" }) {
  const { startDemo } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<DemoRole>("user");

  if (!isDemoAvailable()) return null;

  const enter = () => {
    startDemo(role);
    navigate(demoHomeFor(role), { replace: true });
  };

  if (variant === "strip") {
    return (
      <aside className="demo-strip" aria-label="Demo mode">
        <span className="demo-strip__badge">
          <SparkIcon size={14} /> Demo preview
        </span>
        <p className="demo-strip__text">
          Explore Mindora with sample data — no account, email or backend
          needed.
        </p>
        <div className="demo-strip__actions">
          <label className="sr-only" htmlFor="demo-strip-role">
            Demo role
          </label>
          <select
            id="demo-strip-role"
            className="demo-strip__select"
            value={role}
            onChange={(event) => setRole(event.target.value as DemoRole)}
          >
            {DEMO_ROLES.map((item) => (
              <option key={item.role} value={item.role}>
                {item.label}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={enter}>
            Open demo
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <section className="demo-entry" aria-labelledby="demo-entry-title">
      <div className="demo-entry__head">
        <span className="demo-entry__badge">
          <SparkIcon size={14} /> Demo mode
        </span>
        <h2 id="demo-entry-title">Just want to look around?</h2>
        <p>
          Open a temporary tour with a sample dashboard, chat, mood history,
          screening result, professionals and appointments. No account,
          password or email verification is involved.
        </p>
      </div>
      <div className="demo-entry__row">
        <label className="sr-only" htmlFor="demo-entry-role">
          Demo role
        </label>
        <select
          id="demo-entry-role"
          className="demo-entry__select"
          value={role}
          onChange={(event) => setRole(event.target.value as DemoRole)}
        >
          {DEMO_ROLES.map((item) => (
            <option key={item.role} value={item.role}>
              {item.label} — {ROLE_HINTS[item.role]}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          onClick={enter}
          leftIcon={<SparkIcon size={16} />}
        >
          Enter demo
        </Button>
      </div>
      <p className="demo-entry__note">
        Demo preview. Demo data stays in this browser session, nothing is sent
        to Mindora’s servers, and real sign-up, sign-in and email verification
        are unchanged.
      </p>
    </section>
  );
}
