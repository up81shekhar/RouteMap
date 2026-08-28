import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import * as institutionsApi from "../api/institutions";
import * as authApi from "../api/auth";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function CreateInstitution() {
  useDocumentMeta({ title: "Create your college", noindex: true, path: "/institution/create" });

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "institution_admin") return <Navigate to="/institution" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) {
      setStatus("error");
      setError("This needs a live connection to the server — try again once you're back online.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const { accessToken: newAccessToken } = await institutionsApi.createInstitution(name, accessToken);
      const { user: freshUser } = await authApi.me(newAccessToken);
      setSession(newAccessToken, {
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        institutionId: freshUser.institutionId,
      });
      navigate("/institution");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Couldn't create the institution — try again.");
    }
  }

  return (
    <div className="container-page max-w-lg py-16">
      <p className="station-code mb-3">For colleges &amp; coaching centers</p>
      <h1 className="font-display text-2xl font-semibold">Set up your college on RouteMap</h1>
      <p className="mt-2 text-sm text-text-muted">
        You'll get a join code to share with your students. Once they join, you can track who's
        active and how far they've gotten — free, no setup on their end beyond entering the code.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">College / institution name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Delhi Public School, Rohini"
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Setting up…" : "Create college dashboard"}
        </button>
        <p className="text-xs text-text-faint">
          This turns your account into an institution admin account. You can still browse and learn
          normally — this just adds a dashboard for tracking your students.
        </p>
      </form>
    </div>
  );
}
