import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import SkillTree from "../components/roadmap/SkillTree";
import AdBannerSlot from "../components/ads/AdBannerSlot";
import { LineColor } from "../data/sampleRoadmaps";
import { useAdminStore } from "../store/adminStore";
import { useProgressStore } from "../store/progressStore";
import { computeNodeStates } from "../utils/nodeStates";
import { useDocumentMeta, SITE_URL } from "../hooks/useDocumentMeta";
import { useJsonLd } from "../hooks/useJsonLd";
import { trackEvent } from "../lib/analytics";

const colorHex: Record<LineColor, string> = {
  coral: "#FF6B4A",
  teal: "#38BDF8",
  violet: "#6366F1",
  amber: "#E0A82E",
};

export default function RoadmapDetail() {
  const { slug } = useParams();
  const roadmap = useAdminStore((s) => s.roadmaps.find((r) => r.slug === slug));
  const loadRoadmapDetail = useAdminStore((s) => s.loadRoadmapDetail);
  const loaded = useAdminStore((s) => s.loaded);
  const isOffline = useAdminStore((s) => s.isOffline);
  const retrying = useAdminStore((s) => s.retrying);

  useEffect(() => {
    if (slug) void loadRoadmapDetail(slug);
    // Re-fetch once the backend comes back — isOffline flipping false means
    // retryConnection() just recovered and this page's data may still be
    // the offline placeholder (or, for a roadmap that only exists in the
    // real database, may not have loaded at all yet).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isOffline]);

  useDocumentMeta({
    title: roadmap ? roadmap.title : "Roadmap",
    description: roadmap
      ? `${roadmap.description} A free, structured ${roadmap.title} roadmap — ${roadmap.nodes.length} stations, ~${roadmap.estimatedDurationHours} hours, curated free resources at every step.`
      : undefined,
    path: `/roadmaps/${slug}`,
  });

  useJsonLd(
    roadmap
      ? {
          "@context": "https://schema.org",
          "@type": "Course",
          name: roadmap.title,
          description: roadmap.description,
          provider: { "@type": "Organization", name: "RouteMap", sameAs: SITE_URL },
          url: `${SITE_URL}/roadmaps/${roadmap.slug}`,
          isAccessibleForFree: true,
          educationalLevel: roadmap.difficulty,
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: `PT${roadmap.estimatedDurationHours}H`,
          },
        }
      : null
  );

  useEffect(() => {
    if (roadmap) trackEvent("roadmap_view", { roadmap_slug: roadmap.slug, roadmap_title: roadmap.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmap?.slug]);

  // Subscribing to `completed` (not just calling getState() once) is what
  // makes this re-render the moment a lesson is marked complete elsewhere —
  // otherwise the skill tree only updates on the next full page load.
  const completedProgress = useProgressStore((s) => s.completed);
  const liveNodes = useMemo(
    () => (roadmap ? computeNodeStates(roadmap.slug, roadmap.nodes) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roadmap?.slug, roadmap?.nodes, completedProgress]
  );

  // Still figuring out whether this roadmap exists — either the very first
  // load hasn't resolved yet, or we're offline and actively retrying (e.g.
  // a Render free-tier backend waking up can take up to ~2 minutes). Show a
  // clear "still loading" state instead of a false "not found".
  if (!roadmap && (!loaded || retrying)) {
    return (
      <div className="container-page py-24 text-center">
        <p className="station-code mb-3">{retrying ? "Waking up the server" : "Loading"}</p>
        <h1 className="font-display text-2xl">
          {retrying ? "This can take up to a couple of minutes on a cold start…" : "Loading this roadmap…"}
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Free hosting spins down when idle. Hang tight — this only happens on the first visit in a while.
        </p>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="container-page py-24 text-center">
        <p className="station-code mb-3">Line not found</p>
        <h1 className="font-display text-2xl">We couldn't find that roadmap.</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-accent hover:text-accent-hover">
          ← Back to all lines
        </Link>
      </div>
    );
  }

  const firstAvailableNode = liveNodes.find((n) => n.state !== "locked") ?? liveNodes[0];
  const doneCount = liveNodes.filter((n) => n.state === "done").length;
  const liveProgressPercent = liveNodes.length ? Math.round((doneCount / liveNodes.length) * 100) : 0;

  return (
    <div className="container-page py-12">
      <p className="station-code mb-3">
        <Link to="/" className="hover:text-text-primary">Roadmaps</Link> / {roadmap.title}
      </p>

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        {/* Sidebar: roadmap meta */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorHex[roadmap.color] }} />
            <span className="font-mono text-xs text-text-muted">{roadmap.lineCode}</span>
            {!roadmap.isPublished && (
              <span className="rounded-full bg-border px-2 py-0.5 font-mono text-[10px] uppercase text-text-faint">Draft</span>
            )}
          </div>
          <h1 className="font-display text-2xl font-semibold">{roadmap.title}</h1>
          <p className="mt-3 text-sm text-text-muted">{roadmap.description}</p>

          <div className="mt-6 space-y-4 text-sm">
            <div>
              <p className="station-code mb-1">Difficulty</p>
              <p className="text-text-primary">{roadmap.difficulty}</p>
            </div>
            <div>
              <p className="station-code mb-1">Estimated duration</p>
              <p className="text-text-primary">{roadmap.estimatedDurationHours} hours</p>
            </div>
            <div>
              <p className="station-code mb-1">Prerequisites</p>
              <p className="text-text-primary">
                {roadmap.prerequisites.length ? roadmap.prerequisites.join(", ") : "None"}
              </p>
            </div>
            <div>
              <p className="station-code mb-1">Career outcomes</p>
              <ul className="list-disc space-y-1 pl-4 text-text-primary">
                {roadmap.careerOutcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
              <span>Progress</span>
              <span>{liveProgressPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${liveProgressPercent}%`, background: colorHex[roadmap.color] }}
              />
            </div>
          </div>

          {firstAvailableNode && (
            <Link
              to={`/roadmaps/${roadmap.slug}/${firstAvailableNode.slug}`}
              onClick={() => trackEvent("roadmap_started", { roadmap_slug: roadmap.slug })}
              className="mt-6 inline-block w-full rounded-full bg-text-primary px-4 py-2.5 text-center text-sm font-semibold text-ink hover:opacity-85"
            >
              Continue: {firstAvailableNode.title} →
            </Link>
          )}

          <AdBannerSlot variant="sidebar" className="mt-8" />
        </aside>

        {/* Main: skill tree */}
        <div>
          <p className="station-code mb-2">The line</p>
          <SkillTree roadmapSlug={roadmap.slug} nodes={liveNodes} color={roadmap.color} />
        </div>
      </div>
    </div>
  );
}
