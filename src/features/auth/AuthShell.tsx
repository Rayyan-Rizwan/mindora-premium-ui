import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { Logo } from "@/components/layout/Logo";
import { ShieldIcon } from "@/components/ui/icons";
import { useCompanion } from "@/hooks/useCompanion";
import { classNames } from "@/lib/utils";
import { AuthScene, type AuthMascotState } from "./AuthScene";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  className,
  peek = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  peek?: boolean;
}) {
  const { character } = useCompanion();
  const [mascot, setMascot] = useState<AuthMascotState>("idle");
  const cheerTimeout = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (cheerTimeout.current !== null) {
        window.clearTimeout(cheerTimeout.current);
      }
    },
    [],
  );

  const cheer = () => {
    setMascot("cheerful");
    if (cheerTimeout.current !== null) {
      window.clearTimeout(cheerTimeout.current);
    }
    cheerTimeout.current = window.setTimeout(() => setMascot("idle"), 1800);
  };

  const handleFocus = () => {
    setMascot((current) => (current === "cheerful" ? current : "listening"));
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setMascot((current) => (current === "cheerful" ? current : "idle"));
  };

  return (
    <div
      className={classNames("auth-v2", peek && "auth-v2--peek", className)}
      data-mascot={mascot}
    >
      <main className="auth-v2__panel">
        {peek ? (
          <div className="auth-v2__peek">
            <AuthScene
              character={character}
              state={mascot}
              variant="peek"
              mood="happy"
            />
          </div>
        ) : null}

        <div className="auth-v2__inner">
          <div className="auth-v2__sheet">
            <div className="auth-v2__brand">
              <Logo tagline="Your mind matters" />
            </div>

            <header className="auth-v2__header">
              <h1>{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </header>

            <div
              className="auth-v2__form"
              onFocusCapture={handleFocus}
              onBlurCapture={handleBlur}
              onSubmitCapture={cheer}
            >
              {children}
            </div>

            {footer ? (
              <footer className="auth-v2__footer">{footer}</footer>
            ) : null}

            <p className="auth-v2__safety">
              <ShieldIcon size={14} />
              <span>
                Supportive screening and wellbeing guidance, not emergency care
                or a diagnosis.
              </span>
            </p>
          </div>
        </div>
      </main>

      <aside className="auth-v2__art" aria-hidden="true">
        <AuthScene
          character={character}
          state={mascot}
          variant="panel"
          className="auth-scene--panel"
        />
        <AuthScene
          character={character}
          state={mascot}
          variant="banner"
          className="auth-scene--banner"
        />
      </aside>

      {peek ? (
        <aside className="auth-v2__art auth-v2__art--strip" aria-hidden="true">
          <AuthScene
            character={character}
            state={mascot}
            variant="hills"
            mood="happy"
          />
        </aside>
      ) : null}
    </div>
  );
}
