import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import * as adminApi from "../../api/admin";
import type { AdminInstitutionSummary } from "../../api/admin";

export default function AdminInstitutionsList() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [institutions, setInstitutions] = useState<AdminInstitutionSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  function refresh() {
    if (!accessToken) return;
    setStatus("loading");
    adminApi
      .adminListInstitutions(accessToken)
      .then(({ institutions }) => {
        setInstitutions(institutions);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(refresh, [accessToken]);

  async function handleDelete(inst: AdminInstitutionSummary) {
    if (!accessToken) return;
    const confirmed = confirm(
      `Delete "${inst.name}"? This unlinks all ${inst.studentCount} of its students and can't be undone.`
    );
    if (!confirmed) return;
    setDeletingSlug(inst.slug);
    try {
      await adminApi.adminDeleteInstitution(inst.slug, accessToken);
      refresh();
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div>
      <p className="station-code mb-2">Oversight</p>
      <h1 className="font-display text-2xl font-semibold">Institutions</h1>
      <p className="mt-1 text-sm text-text-muted">
        Every college/coaching center that's self-registered on RouteMap. "Active" means at least
        one student has logged activity in the last 14 days.
      </p>

      {status === "loading" && <p className="mt-6 text-sm text-text-muted">Loading…</p>}
      {status === "error" && <p className="mt-6 text-sm text-error">Couldn't load institutions.</p>}

      {status === "ready" && (
        <div className="mt-6 space-y-2">
          {institutions.length === 0 && (
            <p className="rounded-card border border-border bg-surface p-6 text-sm text-text-faint">
              No institutions have registered yet.
            </p>
          )}
          {institutions.map((inst) => (
            <div
              key={inst.slug}
              className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3"
            >
              <Link to={`/admin/institutions/${inst.slug}`} className="min-w-0 flex-1 hover:opacity-80">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{inst.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      inst.isActive ? "bg-success/10 text-success" : "bg-border text-text-faint"
                    }`}
                  >
                    {inst.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-0.5 truncate font-mono text-xs text-text-faint">
                  ID: {inst.slug} · Join code: {inst.joinCode}
                </p>
              </Link>
              <div className="flex shrink-0 items-center gap-4">
                <span className="text-sm text-text-muted">
                  {inst.activeStudentCount}/{inst.studentCount} active
                </span>
                <button
                  onClick={() => handleDelete(inst)}
                  disabled={deletingSlug === inst.slug}
                  className="rounded border border-border px-2.5 py-1 text-xs text-error hover:border-error disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingSlug === inst.slug ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
