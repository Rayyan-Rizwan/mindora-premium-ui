import { Link } from "react-router-dom";
import { CompanionAvatar } from "@/components/avatar/CompanionAvatar";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRightIcon, HomeIcon } from "@/components/ui/icons";

export default function NotFoundPage() {
  const { user } = useAuth();
  const home = user
    ? user.role === "admin"
      ? "/admin"
      : user.role === "professional"
        ? "/appointments"
        : "/dashboard"
    : "/";

  return (
    <div className="not-found">
      <div className="not-found__ambient" aria-hidden="true">
        <span />
        <span />
      </div>

      <header className="not-found__header">
        <Logo to="/" />
      </header>

      <main className="not-found__body">
        <div className="not-found__companion">
          <CompanionAvatar state="idle" size="lg" />
        </div>
        <p className="eyebrow">A quiet detour</p>
        <h1>This page isn’t here.</h1>
        <p>
          The link may be old, or the page may have moved. Nothing is broken on
          your account — you can return to the space you know.
        </p>
        <div className="not-found__actions">
          <Link to={home} className="btn btn--primary btn--md">
            <HomeIcon size={17} />
            <span>{user ? "Back to your space" : "Back to home"}</span>
          </Link>
          {user ? (
            <Link to="/settings" className="btn btn--secondary btn--md">
              <span>Profile &amp; settings</span>
              <ArrowRightIcon size={16} />
            </Link>
          ) : (
            <Link to="/login" className="btn btn--secondary btn--md">
              <span>Sign in</span>
              <ArrowRightIcon size={16} />
            </Link>
          )}
        </div>
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
      </main>
    </div>
  );
}
