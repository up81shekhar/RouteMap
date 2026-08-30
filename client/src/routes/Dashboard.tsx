import { useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useProgressStore } from "../store/progressStore";
import { useAdminStore } from "../store/adminStore";
import { getStaticTopicContent } from "../data/sampleRoadmaps";
import AdBannerSlot from "../components/ads/AdBannerSlot";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import * as institutionsApi from "../api/institutions";
import * as authApi from "../api/auth";

const colorHex: Record<string, string> = { coral: "#FF6B4A", teal: "#38BDF8", violet: "#6366F1", amber: "#E0A82E" };

type LineProgress = {
  slug: string;
  title: string;
  color: string;
  totalStations: number;
  clearedStations: number;
  percent: number;
  lessonsCompleted: number;
  nextStation?: { slug: string; title: string };
};

export default function Dashboard() {
  useDocumentMeta({ title: "Dashboard", noindex: true, path: "/dashboard" });

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);
  const completed = useProgressStore((s) => s.completed);
  const roadmaps = useAdminStore((s) => s.roadmaps);

  const [joinCode, setJoinCode] = useState("");
  const [joinStatus, setJoinStatus] = useState<"idle" | "loading" | "error">("idle");
  const [joinError, setJoinError] = useState<string | null>(null);

  async function handleJoinInstitution(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setJoinStatus("loading");
    setJoinError(null);
    try {
      await institutionsApi.joinInstitution(joinCode, accessToken);
      const { user: freshUser } = await authApi.me(accessToken);
      setSession(accessToken, {
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        institutionId: freshUser.institutionId,
      });
      setJoinStatus("idle");
      setJoinCode("");
    } catch (err) {
      setJoinStatus("error");
      setJoinError(err instanceof Error ? err.message : "That join code didn't work — check it and try again.");
    }
  }

  // Real progress, computed per roadmap from actual completed-lesson data —
  // not a hardcoded "dsa/arrays" stand-in.
  const lines = useMemo<LineProgress[]>(() => {
    return roadmaps
      .filter((r) => r.isPublished)
      .map((r) => {
        let clearedStations = 0;
        let lessonsCompleted = 0;
        let nextStation: LineProgress["nextStation"];

        for (const node of r.nodes) {
          const key = `${r.slug}/${node.slug}`;
          const totalLessons = getStaticTopicContent(r.slug, node.slug, node.title, node.contentSource).lessons.length;
          const doneLessons = completed[key]?.length ?? 0;
          lessonsCompleted += doneLessons;
          const isCleared = totalLessons > 0 && doneLessons >= totalLessons;
          if (isCleared) clearedStations++;
          else if (!nextStation) nextStation = { slug: node.slug, title: node.title };
        }

        const totalStations = r.nodes.length;
        return {
          slug: r.slug,
          title: r.title,
          color: r.color,
          totalStations,
          clearedStations,
          percent: totalStations ? Math.round((clearedStations / totalStations) * 100) : 0,
          lessonsCompleted,
          nextStation,
        };
      });
  }, [roadmaps, completed]);

  const inProgress = lines
    .filter((l) => l.lessonsCompleted > 0 && l.percent < 100)
    .sort((a, b) => b.percent - a.percent);
  const finished = lines.filter((l) => l.percent === 100 && l.totalStations > 0);

  const totalLessonsCompleted = lines.reduce((sum, l) => sum + l.lessonsCompleted, 0);
  const activeLine = inProgress[0];

  if (!user) return <Navigate to="/login" replace />;

  const greeting =
    new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_280px]">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          {greeting}, {user.name} 👋
        </h1>

        {/* Real stats strip — replaces the old static "This week" filler */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="station-code mb-1">Lessons done</p>
            <p className="font-display text-2xl font-semibold">{totalLessonsCompleted}</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="station-code mb-1">Lines in progress</p>
            <p className="font-display text-2xl font-semibold">{inProgress.length}</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="station-code mb-1">Lines completed</p>
            <p className="font-display text-2xl font-semibold">{finished.length}</p>
          </div>
        </div>

        {/* Jump back in — the ONE most-relevant next station, computed for real */}
        {activeLine?.nextStation && (
          <div className="mt-10">
            <p className="station-code mb-3">Jump back in</p>
            <Link
              to={`/roadmaps/${activeLine.slug}/${activeLine.nextStation.slug}`}
              className="flex items-center justify-between rounded-card border p-4 transition hover:border-border-strong"
              style={{ borderColor: colorHex[activeLine.color] + "55" }}
            >
              <div>
                <p className="text-xs text-text-faint">{activeLine.title}</p>
                <p className="mt-0.5 font-display text-sm font-semibold">{activeLine.nextStation.title}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {activeLine.clearedStations} / {activeLine.totalStations} stations cleared
                </p>
              </div>
              <span className="text-sm font-medium" style={{ color: colorHex[activeLine.color] }}>
                {activeLine.percent}% →
              </span>
            </Link>
          </div>
        )}

        <div className="mt-10">
          <p className="station-code mb-3">Your lines</p>
          <div className="space-y-4">
            {lines
              .filter((l) => l.totalStations > 0)
              .map((l) => (
                <Link
                  key={l.slug}
                  to={`/roadmaps/${l.slug}`}
                  className="block rounded-card border border-border bg-surface p-4 hover:border-border-strong"
                >
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-display font-semibold text-text-primary">{l.title}</span>
                    <span className="text-text-muted">
                      {l.clearedStations}/{l.totalStations} · {l.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-border">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${l.percent}%`, background: colorHex[l.color] }}
                    />
                  </div>
                </Link>
              ))}

            {lines.length === 0 && (
              <div className="rounded-card border border-dashed border-border p-6 text-center">
                <p className="text-sm text-text-muted">No roadmaps published yet — check back soon.</p>
              </div>
            )}
          </div>
        </div>

        {/* Brand-new user with nothing started at all — a real CTA instead of fake filler content */}
        {lines.length > 0 && totalLessonsCompleted === 0 && (
          <div className="mt-10 rounded-card border border-dashed border-border p-6 text-center">
            <p className="font-display text-sm font-semibold">You haven't started a line yet</p>
            <p className="mt-1 text-sm text-text-muted">Pick one below and clear your first station today.</p>
            <Link
              to="/roadmaps"
              className="mt-4 inline-block rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
            >
              Browse roadmaps →
            </Link>
          </div>
        )}

        {/* Next stops — a real, per-user recommended list instead of static hardcoded text */}
        {inProgress.length > 0 && (
          <div className="mt-10">
            <p className="station-code mb-3">Next stops</p>
            <ol className="space-y-2 text-sm text-text-primary">
              {inProgress.slice(0, 3).map((l, i) =>
                l.nextStation ? (
                  <li key={l.slug} className="flex gap-2">
                    <span className="text-text-faint">{i + 1}.</span>
                    <Link to={`/roadmaps/${l.slug}/${l.nextStation.slug}`} className="hover:text-accent hover:underline">
                      {l.nextStation.title}
                    </Link>
                    <span className="text-text-faint">— {l.title}</span>
                  </li>
                ) : null
              )}
            </ol>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <AdBannerSlot variant="sidebar" />
      </aside>
    </div>
  );
}
