import { Navigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useProgressStore } from "../store/progressStore";
import { useAdminStore } from "../store/adminStore";
import AdSlot from "../components/ads/AdSlot";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const colorHex: Record<string, string> = { coral: "#FF6B4A", teal: "#38BDF8", violet: "#6366F1", amber: "#E0A82E" };

export default function Dashboard() {
  useDocumentMeta({ title: "Dashboard", noindex: true, path: "/dashboard" });

  const user = useAuthStore((s) => s.user);
  const arraysCompleted = useProgressStore((s) => s.getCompleted("dsa/arrays"));
  const roadmaps = useAdminStore((s) => s.roadmaps);

  if (!user) return <Navigate to="/login" replace />;

  const continueLearning = roadmaps.filter((r) => r.isPublished).slice(0, 3);
  const dsaRoadmap = roadmaps.find((r) => r.slug === "dsa");
  const arraysNode = dsaRoadmap?.nodes.find((n) => n.slug === "arrays");
  // Arrays has a fixed 6-lesson curated structure (see getStaticTopicContent) — hardcoded
  // here since the dashboard only needs the count, not the full lesson list.
  const arraysTotalLessons = 6;
  const arraysProgress = Math.round((arraysCompleted.length / arraysTotalLessons) * 100);

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_280px]">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          {greeting}, {user.name} 👋
        </h1>

        <div className="mt-8">
          <p className="station-code mb-3">Continue learning</p>
          <div className="space-y-4">
            {continueLearning.map((r) => (
              <Link
                key={r.slug}
                to={`/roadmaps/${r.slug}`}
                className="block rounded-card border border-border bg-surface p-4 hover:border-border-strong"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-display font-semibold text-text-primary">{r.title}</span>
                  <span className="text-text-muted">{r.progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${r.progressPercent}%`, background: colorHex[r.color] }}
                  />
                </div>
              </Link>
            ))}
            {continueLearning.length === 0 && (
              <p className="text-sm text-text-faint">No published roadmaps yet — check back soon.</p>
            )}
          </div>
        </div>

        <div className="mt-10">
          <p className="station-code mb-3">Today's plan</p>
          <ol className="space-y-2 text-sm text-text-primary">
            <li className="flex gap-2"><span className="text-text-faint">1.</span> Complete Array Traversal</li>
            <li className="flex gap-2"><span className="text-text-faint">2.</span> Solve 10 array practice problems</li>
            <li className="flex gap-2"><span className="text-text-faint">3.</span> Watch the Prefix Sum lesson</li>
          </ol>
        </div>

        {arraysNode && (
          <div className="mt-10">
            <p className="station-code mb-3">Continue watching</p>
            <Link
              to="/roadmaps/dsa/arrays"
              className="flex items-center justify-between rounded-card border border-border bg-surface p-4 hover:border-border-strong"
            >
              <div>
                <p className="font-display text-sm font-semibold">Arrays — Data Structures & Algorithms</p>
                <p className="mt-1 text-xs text-text-muted">
                  {arraysCompleted.length} / {arraysTotalLessons} lessons complete
                </p>
              </div>
              <span className="text-sm text-accent">{arraysProgress}% →</span>
            </Link>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <AdSlot placement="roadmap_sidebar" />
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="station-code mb-2">This week</p>
          <p className="text-sm text-text-primary">{arraysCompleted.length} lessons</p>
          <p className="text-sm text-text-primary">1 topic in progress</p>
        </div>
      </aside>
    </div>
  );
}
