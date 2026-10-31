import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";
import { isDemoActive } from "@/demo/demoSession";

/**
 * Inline, in-context reminder for surfaces where an action looks like it
 * reached the real service. Renders nothing outside an active demo session.
 */
export function DemoNote({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success";
}) {
  if (!isDemoActive()) return null;
  return (
    <p className={classNames("demo-note", `demo-note--${tone}`)} role="note">
      {children}
    </p>
  );
}
