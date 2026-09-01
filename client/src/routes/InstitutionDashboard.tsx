import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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

function studentsToCsv(students: InstitutionDashboardData["students"]) {
  const header = "Name,Email,Joined,Lessons Completed,Status\n";
  const rows = students
    .map((s) =>
      [s.name, s.email, new Date(s.joinedAt).toLocaleDateString(), s.lessonsCompleted, s.isActive ? "Active" : "Inactive"]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  return header + rows;
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
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Invite by email
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Notice broadcast
  const [noticeSubject, setNoticeSubject] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeStatus, setNoticeStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [noticeError, setNoticeError] = useState<string | null>(null);

  // Self-service delete, gated behind an emailed OTP — mainly for a
  // student who accidentally created an institution and wants it gone.
  const [deleteStep, setDeleteStep] = useState<"idle" | "otp-sent" | "deleting">("idle");
  const [otp, setOtp] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function refresh() {
    if (!accessToken) return;
    institutionsApi
      .getMyInstitutionDashboard(accessToken)
      .then((res) => {
        setData(res);
        setStatus("ready");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Couldn't load the dashboard.");
        setStatus("error");
      });
  }

  useEffect(() => {
    if (!accessToken) {
      setStatus("error");
      setError("This dashboard needs a live connection to the server.");
      return;
    }
    refresh();
  }, [accessToken]);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.students;
    return data.students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }, [data, search]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "institution_admin") return <Navigate to="/dashboard" replace />;

  function copyJoinCode() {
    if (!data?.institution.joinCode) return;
    void navigator.clipboard.writeText(data.institution.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportCsv() {
    if (!data) return;
    const blob = new Blob([studentsToCsv(data.students)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.institution.slug}-students.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRemoveStudent(studentId: string, name: string) {
    if (!accessToken) return;
    if (!confirm(`Remove ${name} from this institution? They keep their RouteMap account either way.`)) return;
    setRemovingId(studentId);
    try {
      await institutionsApi.removeStudent(studentId, accessToken);
      refresh();
    } finally {
      setRemovingId(null);
    }
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setInviteStatus("sending");
    setInviteError(null);
    try {
      await institutionsApi.inviteStudent(inviteEmail, accessToken);
      setInviteStatus("sent");
      setInviteEmail("");
      setTimeout(() => setInviteStatus("idle"), 3000);
    } catch (err) {
      setInviteStatus("error");
      setInviteError(err instanceof Error ? err.message : "Couldn't send that invite — try again.");
    }
  }

  async function handleSendNotice(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setNoticeStatus("sending");
    setNoticeError(null);
    try {
      await institutionsApi.sendNotice(noticeSubject, noticeMessage, accessToken);
      setNoticeStatus("sent");
      setNoticeSubject("");
      setNoticeMessage("");
      setTimeout(() => setNoticeStatus("idle"), 3000);
    } catch (err) {
      setNoticeStatus("error");
      setNoticeError(err instanceof Error ? err.message : "Couldn't send that notice — try again.");
    }
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
    if (!accessToken || !user) return;
    setDeleteStep("deleting");
    setDeleteError(null);
    try {
      const { accessToken: newAccessToken } = await institutionsApi.confirmDeleteInstitution(otp, accessToken);
      setSession(newAccessToken, { name: user.name, email: user.email, role: "student", institutionId: undefined });
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
            <div className="flex items-center gap-3">
              <Link
                to="/institution/notes"
                className="rounded border border-border px-4 py-2 text-sm text-text-primary hover:border-accent hover:text-accent"
              >
                Class notes
              </Link>
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

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Invite a specific student by email */}
            <div>
              <p className="station-code mb-3">Invite a student</p>
              <form onSubmit={handleInvite} className="space-y-2 rounded-card border border-border bg-surface p-4">
                <input
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@email.com"
                  className="w-full rounded border border-border bg-ink px-3 py-2 text-sm"
                />
                {inviteError && <p className="text-xs text-error">{inviteError}</p>}
                {inviteStatus === "sent" && <p className="text-xs text-success">Invite sent!</p>}
                <button
                  type="submit"
                  disabled={inviteStatus === "sending"}
                  className="rounded bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {inviteStatus === "sending" ? "Sending…" : "Send invite"}
                </button>
              </form>
            </div>

            {/* Notice broadcast — emailed to every current student */}
            <div>
              <p className="station-code mb-3">Send a notice</p>
              <form onSubmit={handleSendNotice} className="space-y-2 rounded-card border border-border bg-surface p-4">
                <input
                  required
                  value={noticeSubject}
                  onChange={(e) => setNoticeSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full rounded border border-border bg-ink px-3 py-2 text-sm"
                />
                <textarea
                  required
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  rows={2}
                  placeholder="Message — emailed to every current student"
                  className="w-full rounded border border-border bg-ink px-3 py-2 text-sm"
                />
                {noticeError && <p className="text-xs text-error">{noticeError}</p>}
                {noticeStatus === "sent" && <p className="text-xs text-success">Sent!</p>}
                <button
                  type="submit"
                  disabled={noticeStatus === "sending"}
                  className="rounded bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {noticeStatus === "sending" ? "Sending…" : "Send to all students"}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="station-code">Students ({filteredStudents.length}{search ? ` of ${data.students.length}` : ""})</p>
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email…"
                  className="rounded border border-border bg-surface px-3 py-1.5 text-sm"
                />
                <button
                  onClick={exportCsv}
                  disabled={data.students.length === 0}
                  className="rounded border border-border px-3 py-1.5 text-xs text-text-muted hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {data.students.length === 0 ? (
              <p className="mt-3 rounded-card border border-border bg-surface p-6 text-sm text-text-faint">
                No students yet — share your join code or invite someone above.
              </p>
            ) : filteredStudents.length === 0 ? (
              <p className="mt-3 rounded-card border border-border bg-surface p-6 text-sm text-text-faint">
                No students match "{search}".
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-card border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface text-xs uppercase tracking-wide text-text-faint">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium">Lessons completed</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="border-t border-border">
                        <td className="px-4 py-3">
                          <Link to={`/institution/students/${s.id}`} className="text-text-primary hover:text-accent hover:underline">
                            {s.name}
                          </Link>
                        </td>
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
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveStudent(String(s.id), s.name)}
                            disabled={removingId === String(s.id)}
                            className="rounded border border-border px-2.5 py-1 text-xs text-error hover:border-error disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {removingId === String(s.id) ? "Removing…" : "Remove"}
                          </button>
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
