import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Login() {
  useDocumentMeta({ title: "Log In", noindex: true, path: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginAsAdmin = useAuthStore((s) => s.loginAsAdmin);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdminDemo() {
    await loginAsAdmin();
    navigate("/admin");
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="station-code mb-2">Welcome back</p>
        <h1 className="font-display text-2xl font-semibold">Log in</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-muted">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm text-text-muted">Password</label>
              <Link to="/forgot-password" className="text-xs text-accent hover:text-accent-hover">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
          {formError && <p className="text-sm text-danger">{formError}</p>}
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          New here?{" "}
          <Link to="/signup" className="text-accent hover:text-accent-hover">
            Create a free account
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-text-faint">
          Connects to the real API when it's running — falls back to a local demo session if it isn't reachable.
        </p>
        {import.meta.env.DEV && (
          <button
            onClick={handleAdminDemo}
            className="mt-3 w-full text-center text-xs text-text-faint underline hover:text-text-muted"
          >
            Demo: continue as admin →
          </button>
        )}
      </div>
    </div>
  );
}
