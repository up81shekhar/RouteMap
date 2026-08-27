import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdsterraSlot from "../components/ads/AdsterraSlot";
import { useAdminStore } from "../store/adminStore";
import * as searchApi from "../api/search";
import { ApiUnreachableError } from "../api/client";
import { localSearch, LocalTopicMatch } from "../utils/search";
import { ApiRoadmap } from "../api/roadmaps";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { trackEvent } from "../lib/analytics";

const colorHex: Record<string, string> = { coral: "#FF6B4A", teal: "#38BDF8", violet: "#6366F1", amber: "#E0A82E" };

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  useDocumentMeta({
    title: q ? `Search: ${q}` : "Search",
    description: q ? `Search results for "${q}" on RouteMap.` : "Search RouteMap's free roadmaps and topics.",
    path: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    noindex: true, // query-driven results page — not useful as an indexed landing page
  });
  const [input, setInput] = useState(q);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [remoteRoadmaps, setRemoteRoadmaps] = useState<ApiRoadmap[] | null>(null);
  const [remoteTopics, setRemoteTopics] = useState<LocalTopicMatch[] | null>(null);

  const adminRoadmaps = useAdminStore((s) => s.roadmaps);
  const isOffline = useAdminStore((s) => s.isOffline);

  useEffect(() => {
    setInput(q);
    if (!q.trim()) {
      setRemoteRoadmaps(null);
      setRemoteTopics(null);
      return;
    }

    trackEvent("search", { query: q });

    function fallbackToLocal() {
      const { roadmaps, topics } = localSearch(q, adminRoadmaps);
      setRemoteRoadmaps(
        roadmaps.map((r) => ({
          _id: r.slug, slug: r.slug, lineCode: r.lineCode, title: r.title, description: r.description,
          category: r.category, color: r.color, difficulty: r.difficulty, estimatedDurationHours: r.estimatedDurationHours,
          prerequisites: r.prerequisites, careerOutcomes: r.careerOutcomes, isPublished: r.isPublished, nodeCount: r.nodes.length,
        }))
      );
      setRemoteTopics(topics);
    }

    if (isOffline) {
      fallbackToLocal();
      return;
    }

    setStatus("loading");
    searchApi
      .search(q)
      .then(({ roadmaps, topics }) => {
        setRemoteRoadmaps(roadmaps);
        setRemoteTopics(
          topics.map((t) => ({ roadmapSlug: t.roadmapSlug, roadmapTitle: "", slug: t.slug, title: t.title, estimatedHours: t.estimatedHours }))
        );
      })
      .catch((err) => {
        if (err instanceof ApiUnreachableError) fallbackToLocal();
      })
      .finally(() => setStatus("idle"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, isOffline]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setParams(input.trim() ? { q: input.trim() } : {});
  }

  const topRoadmap = remoteRoadmaps?.[0];
  const hasResults = (remoteRoadmaps && remoteRoadmaps.length > 0) || (remoteTopics && remoteTopics.length > 0);

  return (
    <div className="container-page py-12">
      <form onSubmit={handleSubmit} className="mb-10 flex items-center gap-2 rounded-lg border border-border bg-surface p-1.5 pl-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Try "DSA", "linked list", "React", "SQL"...'
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-faint focus:outline-none"
          autoFocus
        />
        <button className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
          Search
        </button>
      </form>

      {!q.trim() && <p className="text-sm text-text-muted">Type something above to search roadmaps and topics.</p>}

      {q.trim() && status === "loading" && <p className="text-sm text-text-muted">Searching…</p>}

      {q.trim() && status === "idle" && !hasResults && (
        <p className="text-sm text-text-muted">No results for "{q}". Try a broader term like "DSA" or "React".</p>
      )}

      {topRoadmap && (
        <div className="mb-10">
          <p className="station-code mb-3">Recommended roadmap</p>
          <Link
            to={`/roadmaps/${topRoadmap.slug}`}
            className="flex items-center justify-between rounded-card border border-border bg-surface p-5 hover:border-border-strong"
          >
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorHex[topRoadmap.color] }} />
              <div>
                <p className="font-display text-base font-semibold text-text-primary">{topRoadmap.title}</p>
                <p className="mt-1 text-xs text-text-muted">{topRoadmap.description}</p>
              </div>
            </div>
            <span className="shrink-0 rounded bg-accent px-3 py-1.5 text-xs font-medium text-white">Start roadmap →</span>
          </Link>
        </div>
      )}

      {remoteTopics && remoteTopics.length > 0 && (
        <div className="mb-10">
          <p className="station-code mb-3">Topics</p>
          <div className="flex flex-wrap gap-2">
            {remoteTopics.map((t) => (
              <Link
                key={`${t.roadmapSlug}/${t.slug}`}
                to={`/roadmaps/${t.roadmapSlug}/${t.slug}`}
                className="rounded-full border border-border px-3.5 py-1.5 text-sm text-text-muted hover:border-border-strong hover:text-text-primary"
              >
                {t.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {remoteRoadmaps && remoteRoadmaps.length > 1 && (
        <div className="mb-10">
          <p className="station-code mb-3">More roadmaps</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {remoteRoadmaps.slice(1).map((r) => (
              <Link
                key={r.slug}
                to={`/roadmaps/${r.slug}`}
                className="rounded-card border border-border bg-surface p-4 hover:border-border-strong"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: colorHex[r.color] }} />
                  <span className="font-mono text-xs text-text-muted">{r.lineCode}</span>
                </div>
                <p className="mt-2 font-display text-sm font-semibold text-text-primary">{r.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <AdSlot placement="search_sidebar" className="mt-4" />
    </div>
  );
}
