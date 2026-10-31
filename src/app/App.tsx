import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { RelaxPlayerProvider } from "@/features/relax/player";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Spinner } from "@/components/ui";
import type { User } from "@/types";

const LandingPage = lazy(() => import("@/features/auth/LandingPage"));
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"));
const CheckEmailPage = lazy(() => import("@/features/auth/CheckEmailPage"));
const VerifyEmailPage = lazy(() => import("@/features/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(
  () => import("@/features/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
  () => import("@/features/auth/ResetPasswordPage"),
);
const OnboardingPage = lazy(() => import("@/features/auth/OnboardingPage"));

const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const ChatPage = lazy(() => import("@/features/chat/ChatPage"));
const RelaxPage = lazy(() => import("@/features/relax/RelaxPage"));
const BreathingPage = lazy(() => import("@/features/relax/BreathingPage"));
const MindfulSoundsPage = lazy(
  () => import("@/features/relax/MindfulSoundsPage"),
);
const MoodPage = lazy(() => import("@/features/mood/MoodPage"));
const AssessmentPage = lazy(
  () => import("@/features/assessment/AssessmentPage"),
);
const ProfessionalsPage = lazy(
  () => import("@/features/appointments/ProfessionalsPage"),
);
const AppointmentsPage = lazy(
  () => import("@/features/appointments/AppointmentsPage"),
);
const NotificationsPage = lazy(
  () => import("@/features/notifications/NotificationsPage"),
);
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage"));
const KnowledgeLibraryPage = lazy(
  () => import("@/features/library/KnowledgeLibraryPage"),
);

const AdminOverviewPage = lazy(
  () => import("@/features/admin/AdminOverviewPage"),
);
const AdminUsersPage = lazy(() => import("@/features/admin/AdminUsersPage"));
const AdminAppointmentsPage = lazy(
  () => import("@/features/admin/AdminAppointmentsPage"),
);
const AdminApplicationsPage = lazy(
  () => import("@/features/admin/AdminApplicationsPage"),
);
const AdminReportsPage = lazy(
  () => import("@/features/admin/AdminReportsPage"),
);

const AdminBroadcastPage = lazy(
  () => import("@/features/admin/AdminBroadcastPage"),
);

const NotFoundPage = lazy(() => import("@/features/NotFoundPage"));

function homeFor(user: User) {
  if (user.role === "admin") return "/admin";
  if (user.role === "professional") return "/appointments";
  return "/dashboard";
}

function RouteFallback() {
  return (
    <div className="route-loading route-loading--screen" role="status">
      <Spinner size={24} />
      <span>Preparing your space…</span>
    </div>
  );
}

function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return <RouteFallback />;
  if (user) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<RequireAuth roles={["user"]} />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/relax" element={<RelaxPage />} />
            <Route path="/listen" element={<MindfulSoundsPage />} />
            <Route path="/relax/breathing" element={<BreathingPage />} />
            <Route path="/relax/player" element={<MindfulSoundsPage />} />
            <Route path="/professionals" element={<ProfessionalsPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth roles={["user", "professional"]} />}>
          <Route element={<AppShell />}>
            <Route path="/appointments" element={<AppointmentsPage />} />
          </Route>
        </Route>

        <Route
          element={<RequireAuth roles={["user", "professional", "admin"]} />}
        >
          <Route element={<AppShell />}>
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth roles={["admin"]} />}>
          <Route
            path="/library"
            element={<Navigate to="/admin/knowledge-base" replace />}
          />
          <Route element={<AppShell />}>
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route
              path="/admin/knowledge-base"
              element={<KnowledgeLibraryPage />}
            />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            <Route
              path="/admin/applications"
              element={<AdminApplicationsPage />}
            />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route
              path="/admin/broadcast"
              element={<AdminBroadcastPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RelaxPlayerProvider>
          <AppRoutes />
        </RelaxPlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
