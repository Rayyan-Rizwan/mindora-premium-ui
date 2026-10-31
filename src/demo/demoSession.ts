import type { User } from "@/types";

export type DemoRole = "user" | "professional" | "admin";

export const DEMO_ROLE_KEY = "mindora_demo_role";

export const DEMO_ROLES: { role: DemoRole; label: string }[] = [
  { role: "user", label: "Member" },
  { role: "professional", label: "Professional" },
  { role: "admin", label: "Admin" },
];

interface DemoRuntime {
  userForRole: (role: DemoRole) => User;
}

let activeRole: DemoRole | null = null;
let runtime: DemoRuntime | null = null;
const listeners = new Set<() => void>();

function isDemoRole(value: unknown): value is DemoRole {
  return value === "user" || value === "professional" || value === "admin";
}

/**
 * Demo mode is available in every build so the sample workspace can be opened
 * from the landing page and sign-in screen in production too. Requests are only
 * answered by the mock adapter while a demo role is active; all other traffic
 * still reaches the real backend.
 */
export function isDemoAvailable(): boolean {
  return true;
}

export function demoHomeFor(role: DemoRole): string {
  if (role === "admin") return "/admin";
  if (role === "professional") return "/appointments";
  return "/dashboard";
}

export function installDemoSession(): void {
  if (!isDemoAvailable()) return;
  activeRole = readStoredRole();
}

function readStoredRole(): DemoRole | null {
  if (!isDemoAvailable()) return null;
  try {
    const value = sessionStorage.getItem(DEMO_ROLE_KEY);
    return isDemoRole(value) ? value : null;
  } catch {
    return null;
  }
}

export function registerDemoRuntime(next: DemoRuntime | null): void {
  runtime = next;
}

export function getDemoRole(): DemoRole | null {
  return isDemoAvailable() ? activeRole : null;
}

export function isDemoActive(): boolean {
  return getDemoRole() !== null;
}

export function getDemoUser(): User | null {
  const role = getDemoRole();
  if (!role || !runtime) return null;
  return runtime.userForRole(role);
}

export function setDemoRole(role: DemoRole | null): void {
  if (!isDemoAvailable()) return;
  activeRole = role;
  try {
    if (role) {
      sessionStorage.setItem(DEMO_ROLE_KEY, role);
    } else {
      sessionStorage.removeItem(DEMO_ROLE_KEY);
    }
  } catch {
    // Session storage is optional; the in-memory role still works.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeDemo(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
