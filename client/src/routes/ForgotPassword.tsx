import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import * as authApi from "../api/auth";
import { ApiUnreachableError } from "../api/client";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function ForgotPassword() {
  useDocumentMeta({ title: "Forgot Password", noindex: true, path: "/forgot-password" });

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
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

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="station-code mb-2">Reset access</p>
        <h1 className="font-display text-2xl font-semibold">Forgot your password?</h1>

        {sent ? (
          <div className="mt-6 rounded-card border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
            It expires in 1 hour — check your inbox (and spam folder).
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-text-muted">
              Enter the email on your account and we'll send a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>
              {formError && <p className="text-sm text-danger">{formError}</p>}
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link to="/login" className="text-accent hover:text-accent-hover">
            ← Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
