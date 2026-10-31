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
 * Demo mode is compiled out of production behaviour: Vite replaces
 * `import.meta.env.DEV` with `false` in `vite build`, so every entry point and
 * the mock adapter below become unreachable. The mock fixtures themselves are
 * only loaded from a dynamic import inside a `DEV` branch in `main.tsx`.
 */
export function isDemoAvailable(): boolean {
  return import.meta.env.DEV;
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
