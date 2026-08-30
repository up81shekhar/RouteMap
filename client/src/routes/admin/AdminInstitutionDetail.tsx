import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import * as adminApi from "../../api/admin";
import type { InstitutionDashboard as InstitutionDashboardData } from "../../api/institutions";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="station-code mb-1">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function AdminInstitutionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [data, setData] = useState<InstitutionDashboardData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!accessToken || !slug || !data) return;
    const confirmed = confirm(
      `Delete "${data.institution.name}"? This unlinks all ${data.stats.totalStudents} of its students and can't be undone.`
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await adminApi.adminDeleteInstitution(slug, accessToken);
      navigate("/admin/institutions");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (!accessToken || !slug) return;
    adminApi
      .adminGetInstitutionDashboard(slug, accessToken)
      .then((res) => {
        setData(res);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [accessToken, slug]);

  return (
    <div>
      <p className="station-code mb-2">
        <Link to="/admin/institutions" className="hover:text-text-primary">Institutions</Link> / {slug}
      </p>

      {status === "loading" && <p className="text-sm text-text-muted">Loading…</p>}
      {status === "error" && <p className="text-sm text-error">Couldn't load this institution.</p>}

      {status === "ready" && data && (
        <>
          <h1 className="font-display text-2xl font-semibold">{data.institution.name}</h1>
          {data.institution.joinCode && (
            <p className="mt-1 font-mono text-xs text-text-faint">Join code: {data.institution.joinCode}</p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total students" value={data.stats.totalStudents} />
            <StatCard label="Active (last 14 days)" value={data.stats.activeStudents} />
            <StatCard label="Lessons completed" value={data.stats.totalLessonsCompleted} />
          </div>

          {data.roadmapEngagement.length > 0 && (
            <div className="mt-8">
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

          <div className="mt-8">
            <p className="station-code mb-3">Students ({data.students.length})</p>
            {data.students.length === 0 ? (
              <p className="rounded-card border border-border bg-surface p-6 text-sm text-text-faint">
                No students yet.
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
                        <td className="px-4 py-3 text-text-muted">{new Date(s.joinedAt).toLocaleDateString()}</td>
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
        </>
      )}
    </div>
  );
}
