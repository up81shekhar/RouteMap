import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import * as adminApi from "../../api/admin";
import type { AdminInstitutionSummary } from "../../api/admin";

export default function AdminInstitutionsList() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [institutions, setInstitutions] = useState<AdminInstitutionSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!accessToken) return;
    adminApi
      .adminListInstitutions(accessToken)
      .then(({ institutions }) => {
        setInstitutions(institutions);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [accessToken]);

  return (
    <div>
      <p className="station-code mb-2">Oversight</p>
      <h1 className="font-display text-2xl font-semibold">Institutions</h1>
      <p className="mt-1 text-sm text-text-muted">
        Every college/coaching center that's self-registered on RouteMap.
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
            <Link
              key={inst.slug}
              to={`/admin/institutions/${inst.slug}`}
              className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3 hover:border-border-strong"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{inst.name}</p>
                <p className="font-mono text-xs text-text-faint">Join code: {inst.joinCode}</p>
              </div>
              <span className="text-sm text-text-muted">{inst.studentCount} students</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
