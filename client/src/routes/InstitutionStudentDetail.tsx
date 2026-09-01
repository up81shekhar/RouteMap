import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import * as institutionsApi from "../api/institutions";
import type { StudentDetail } from "../api/institutions";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function InstitutionStudentDetail() {
  useDocumentMeta({ title: "Student detail", noindex: true, path: "/institution/students" });

  const { studentId } = useParams<{ studentId: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [data, setData] = useState<StudentDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!accessToken || !studentId) return;
    institutionsApi
      .getStudentDetail(studentId, accessToken)
      .then((res) => {
        setData(res);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [accessToken, studentId]);

  return (
    <div className="container-page py-12">
      <p className="station-code mb-2">
        <Link to="/institution" className="hover:text-text-primary">College dashboard</Link> / Student
      </p>

      {status === "loading" && <p className="text-sm text-text-muted">Loading…</p>}
      {status === "error" && <p className="text-sm text-error">Couldn't load this student.</p>}

      {status === "ready" && data && (
        <>
          <h1 className="font-display text-2xl font-semibold">{data.student.name}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {data.student.email} · Joined {new Date(data.student.joinedAt).toLocaleDateString()}
          </p>

          <div className="mt-8">
            <p className="station-code mb-3">Progress by roadmap</p>
            {data.roadmaps.length === 0 ? (
              <p className="rounded-card border border-border bg-surface p-6 text-sm text-text-faint">
                No activity yet.
              </p>
            ) : (
              <div className="space-y-2">
                {data.roadmaps.map((r) => (
                  <div
                    key={r.roadmapSlug}
                    className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3 text-sm"
                  >
                    <span className="text-text-primary">{r.roadmapSlug}</span>
                    <div className="flex items-center gap-4 text-text-muted">
                      <span>{r.lessonsCompleted} lessons completed</span>
                      {r.lastActivityAt && (
                        <span className="text-xs text-text-faint">
                          Last active {new Date(r.lastActivityAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
