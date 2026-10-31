import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SESSION_EXPIRED_EVENT,
  clearStoredToken,
  getStoredToken,
  storeToken,
} from "@/api/client";
import { login as loginRequest, logout as logoutRequest } from "@/api/auth";
import { fetchMe } from "@/api/users";
import {
  getDemoUser,
  isDemoActive,
  isDemoAvailable,
  setDemoRole as updateDemoRole,
  getDemoRole,
  subscribeDemo,
  type DemoRole,
} from "@/demo/demoSession";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  setUser: (user: User | null) => void;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  isDemo: boolean;
  demoRole: DemoRole | null;
  startDemo: (role?: DemoRole) => void;
  exitDemo: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getDemoUser());
  const [loading, setLoading] = useState<boolean>(
    () => !isDemoActive() && Boolean(getStoredToken()),
  );
  const [sessionExpired, setSessionExpired] = useState(false);
  const [demoRole, setDemoRoleState] = useState<DemoRole | null>(() =>
    getDemoRole(),
  );

  const refreshUser = useCallback(async () => {
    if (isDemoActive()) {
      const demoUser = getDemoUser();
      setUser(demoUser);
      return demoUser;
    }
    if (!getStoredToken()) {
      setUser(null);
      return null;
    }
    const current = await fetchMe();
    setUser(current);
    return current;
  }, []);

  useEffect(() => {
    const sync = () => {
      setUser(getDemoUser());
      setDemoRoleState(getDemoRole());
      if (isDemoActive()) setLoading(false);
    };
    if (isDemoActive()) sync();
    return subscribeDemo(sync);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (isDemoActive() || !getStoredToken()) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const current = await fetchMe();
        if (!cancelled) setUser(current);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setSessionExpired(true);
      setLoading(false);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const token = await loginRequest(email, password);
    storeToken(token.access_token);
    setSessionExpired(false);
    try {
      const current = await fetchMe();
      setUser(current);
      return current;
    } catch (error) {
      clearStoredToken();
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoActive()) {
      updateDemoRole(null);
      setUser(null);
      return;
    }
    try {
      await logoutRequest();
    } catch {
      // Local sign-out must still succeed if the server is unreachable.
    } finally {
      clearStoredToken();
      setUser(null);
    }
  }, []);

  const startDemo = useCallback((role: DemoRole = "user") => {
    if (!isDemoAvailable()) return;
    setSessionExpired(false);
    setLoading(false);
    updateDemoRole(role);
    setUser(getDemoUser());
  }, []);

  const exitDemo = useCallback(() => {
    updateDemoRole(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
      refreshUser,
      setUser,
      sessionExpired,
      clearSessionExpired: () => setSessionExpired(false),
      isDemo: demoRole !== null,
      demoRole,
      startDemo,
      exitDemo,
    }),
    [
      user,
      loading,
      signIn,
      signOut,
      refreshUser,
      sessionExpired,
      demoRole,
      startDemo,
      exitDemo,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
