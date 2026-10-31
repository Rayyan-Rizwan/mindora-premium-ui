import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DEMO_ROLES,
  demoHomeFor,
  type DemoRole,
} from "@/demo/demoSession";
import { CloseIcon } from "@/components/ui/icons";

/**
 * Persistent reminder shown on every authenticated screen while the demo is
 * active, with the role switcher and the exit control always within reach.
 */
export function DemoBanner() {
  const { demoRole, startDemo, exitDemo } = useAuth();
  const navigate = useNavigate();

  if (!demoRole) return null;

  const switchRole = (role: DemoRole) => {
    startDemo(role);
    navigate(demoHomeFor(role), { replace: true });
  };

  const exit = () => {
    exitDemo();
    navigate("/login", { replace: true });
  };

  return (
    <div className="demo-banner" role="region" aria-label="Demo mode active">
      <span className="demo-banner__dot" aria-hidden="true" />
      <strong className="demo-banner__title">Demo mode</strong>
      <span className="demo-banner__text">
        Sample data only · actions stay in this browser
      </span>

      <label className="sr-only" htmlFor="demo-banner-role">
        Demo role
      </label>
      <select
        id="demo-banner-role"
        className="demo-banner__select"
        value={demoRole}
        onChange={(event) => switchRole(event.target.value as DemoRole)}
      >
        {DEMO_ROLES.map((item) => (
          <option key={item.role} value={item.role}>
            {item.label}
          </option>
        ))}
      </select>

      <button type="button" className="demo-banner__exit" onClick={exit}>
        <CloseIcon size={14} />
        <span>Exit demo</span>
      </button>
    </div>
  );
}
