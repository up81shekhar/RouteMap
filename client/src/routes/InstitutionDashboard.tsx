import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import * as institutionsApi from "../api/institutions";
import type { InstitutionDashboard as InstitutionDashboardData } from "../api/institutions";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="station-code mb-1">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function InstitutionDashboard() {
  useDocumentMeta({ title: "College dashboard", noindex: true, path: "/institution" });

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  const [data, setData] = useState<InstitutionDashboardData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Self-service delete, gated behind an emailed OTP — mainly for a
  // student who accidentally created an institution and wants it gone.
  const [deleteStep, setDeleteStep] = useState<"idle" | "otp-sent" | "deleting">("idle");
  const [otp, setOtp] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setStatus("error");
      setError("This dashboard needs a live connection to the server.");
      return;
    }
    let cancelled = false;
    institutionsApi
      .getMyInstitutionDashboard(accessToken)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setStatus("ready");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Couldn't load the dashboard.");
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "institution_admin") return <Navigate to="/dashboard" replace />;

  function copyJoinCode() {
    if (!data?.institution.joinCode) return;
    void navigator.clipboard.writeText(data.institution.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRequestOtp() {
    if (!accessToken) return;
    setDeleteError(null);
    try {
      await institutionsApi.requestDeleteInstitutionOtp(accessToken);
      setDeleteStep("otp-sent");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Couldn't send the code — try again.");
    }
  }

  async function handleConfirmDelete() {
    if (!accessToken) return;
    setDeleteStep("deleting");
    setDeleteError(null);
    try {
      const { accessToken: newAccessToken } = await institutionsApi.confirmDeleteInstitution(otp, accessToken);
      setSession(newAccessToken, {
        name: user.name,
        email: user.email,
        role: "student",
        institutionId: undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      setDeleteStep("otp-sent");
      setDeleteError(err instanceof Error ? err.message : "That code didn't work — check it and try again.");
    }
  }

  return (
    <div className="container-page py-12">
      {status === "loading" && <p className="text-sm text-text-muted">Loading your dashboard…</p>}
      {status === "error" && <p className="text-sm text-error">{error}</p>}

      {status === "ready" && data && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="station-code mb-2">College dashboard</p>
              <h1 className="font-display text-2xl font-semibold">{data.institution.name}</h1>
            </div>
            {data.institution.joinCode && (
              <div className="rounded-card border border-border bg-surface px-4 py-3">
                <p className="text-xs text-text-muted">Share this join code with students</p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="font-mono text-lg font-semibold tracking-widest">
                    {data.institution.joinCode}
                  </span>
                  <button
                    onClick={copyJoinCode}
                    className="rounded border border-border px-2.5 py-1 text-xs text-text-muted hover:border-border-strong hover:text-text-primary"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total students" value={data.stats.totalStudents} />
            <StatCard label="Active (last 14 days)" value={data.stats.activeStudents} />
            <StatCard label="Lessons completed" value={data.stats.totalLessonsCompleted} />
          </div>

          {data.roadmapEngagement.length > 0 && (
            <div className="mt-10">
              <p className="station-code mb-3">Roadmap engagement</p>
              <div className="space-y-2">
                {data.roadmapEngagement.map((r) => (
                  <div
                    key={r.roadmapSlug}
                    className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-2.5 text-sm"
                  >
                    <span className="text-text-primary">{r.roadmapSlug}</span>
                    <span className="text-text-muted">{r.studentsEngaged} students</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <p className="station-code mb-3">Students ({data.students.length})</p>
            {data.students.length === 0 ? (
              <p className="rounded-card border border-border bg-surface p-6 text-sm text-text-faint">
                No students yet — share your join code above to get started.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-card border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface text-xs uppercase tracking-wide text-text-faint">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium">Lessons completed</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map((s) => (
                      <tr key={s.id} className="border-t border-border">
                        <td className="px-4 py-3 text-text-primary">{s.name}</td>
                        <td className="px-4 py-3 text-text-muted">{s.email}</td>
                        <td className="px-4 py-3 text-text-muted">
                          {new Date(s.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-text-primary">{s.lessonsCompleted}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              s.isActive ? "bg-success/10 text-success" : "bg-border text-text-faint"
                            }`}
                          >
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Self-service delete — for a student who accidentally set one up.
              Requires an emailed OTP so this can't happen by a stray click. */}
          <div className="mt-14 rounded-card border border-error/30 p-4">
            <p className="text-sm font-medium text-error">Danger zone</p>
            <p className="mt-1 text-xs text-text-muted">
              Made this institution by mistake? Deleting it unlinks every student and can't be undone.
            </p>

            {deleteStep === "idle" && (
              <button
                onClick={handleRequestOtp}
                className="mt-3 rounded border border-error px-3 py-1.5 text-xs text-error hover:bg-error/10"
              >
                Delete this institution
              </button>
            )}

            {deleteStep !== "idle" && (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div>
                  <label className="mb-1 block text-xs text-text-muted">
                    Code sent to {user.email} — enter it to confirm
                  </label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="6-digit code"
                    className="w-36 rounded border border-border bg-surface px-2.5 py-1.5 text-sm font-mono tracking-widest"
                  />
                </div>
                <button
                  onClick={handleConfirmDelete}
                  disabled={otp.length !== 6 || deleteStep === "deleting"}
                  className="rounded bg-error px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteStep === "deleting" ? "Deleting…" : "Confirm delete"}
                </button>
                <button
                  onClick={() => {
                    setDeleteStep("idle");
                    setOtp("");
                    setDeleteError(null);
                  }}
                  className="rounded border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            )}
            {deleteError && <p className="mt-2 text-xs text-error">{deleteError}</p>}
          </div>
        </>
      )}
    </div>
  );
}
