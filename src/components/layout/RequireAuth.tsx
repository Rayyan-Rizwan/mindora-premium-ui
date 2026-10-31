import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui";
import type { UserRole } from "@/types";

export function RequireAuth({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="route-loading" role="status">
        <Spinner size={22} />
        <span>Preparing your space…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (roles && !roles.includes(user.role)) {
    const fallback =
      user.role === "admin"
        ? "/admin"
        : user.role === "professional"
          ? "/appointments"
          : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
