import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * Client-side gate only. The real system also enforces this server-side via
 * requireAdmin middleware on every /api/admin/* route (see docs/ARCHITECTURE.md) —
 * hiding the UI is a UX nicety here, not the actual security boundary.
 */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="container-page py-24 text-center">
        <p className="station-code mb-3">Admin area</p>
        <h1 className="font-display text-2xl">Log in to continue.</h1>
        <Link to="/login" className="mt-4 inline-block text-sm text-accent hover:text-accent-hover">
          Go to login →
        </Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="container-page py-24 text-center">
        <p className="station-code mb-3">Admin area</p>
        <h1 className="font-display text-2xl">This account doesn't have admin access.</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-sm text-accent hover:text-accent-hover">
          Back to dashboard →
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
