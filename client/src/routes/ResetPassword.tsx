import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as authApi from "../api/auth";
import { ApiUnreachableError } from "../api/client";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function ResetPassword() {
  useDocumentMeta({ title: "Reset Password", noindex: true, path: "/reset-password" });

  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      navigate("/login");
    } catch (err) {
      if (err instanceof ApiUnreachableError) {
        setFormError("Can't reach the server right now — it may be waking up from sleep. Try again in a minute.");
      } else {
        setFormError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16 text-center">
        <div className="w-full max-w-sm">
          <p className="station-code mb-2">Reset access</p>
          <h1 className="font-display text-2xl font-semibold">This link is missing its token.</h1>
          <p className="mt-3 text-sm text-text-muted">
            Make sure you opened the exact link from your email, or request a new one.
          </p>
          <Link to="/forgot-password" className="mt-4 inline-block text-sm text-accent hover:text-accent-hover">
            Request a new reset link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="station-code mb-2">Reset access</p>
        <h1 className="font-display text-2xl font-semibold">Set a new password</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-muted">New password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-muted">Confirm new password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              placeholder="Repeat your new password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? "Updating…" : "Update password"}
          </button>
          {formError && <p className="text-sm text-danger">{formError}</p>}
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link to="/login" className="text-accent hover:text-accent-hover">
            ← Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
