import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RoadmapCard, { RoadmapCardData } from "../components/roadmap/RoadmapCard";
import AdSlot from "../components/ads/AdSlot";
import { RoadmapCategory } from "../data/sampleRoadmaps";
import { useAdminStore } from "../store/adminStore";

const categories: { key: RoadmapCategory | "all"; label: string }[] = [
  { key: "all", label: "All lines" },
  { key: "tech", label: "Tech" },
  { key: "exam", label: "Exam prep" },
  { key: "school", label: "School (11–12)" },
  { key: "skill", label: "Skill" },
];

const validCategories = new Set(categories.map((c) => c.key));

export default function Roadmaps() {
  const adminRoadmaps = useAdminStore((s) => s.roadmaps);
  const loaded = useAdminStore((s) => s.loaded);
  const retrying = useAdminStore((s) => s.retrying);
  const [params, setParams] = useSearchParams();
  const categoryParam = params.get("category");
  const activeCategory: RoadmapCategory | "all" =
    categoryParam && validCategories.has(categoryParam as RoadmapCategory) ? (categoryParam as RoadmapCategory) : "all";

  function setActiveCategory(key: RoadmapCategory | "all") {
    setParams(key === "all" ? {} : { category: key });
  }

  const roadmaps: RoadmapCardData[] = useMemo(
    () =>
      adminRoadmaps
        .filter((r) => r.isPublished)
        .map((r) => ({
          slug: r.slug,
          lineCode: r.lineCode,
          title: r.title,
          stops: r.nodes.length,
          hours: r.estimatedDurationHours,
          color: r.color,
          category: r.category,
        })),
    [adminRoadmaps]
  );

  const filtered = useMemo(
    () => (activeCategory === "all" ? roadmaps : roadmaps.filter((r) => r.category === activeCategory)),
    [activeCategory, roadmaps]
  );

  return (
    <div className="container-page py-12">
      <p className="station-code mb-2">Every line</p>
      <h1 className="mb-8 font-display text-2xl font-semibold">All roadmaps</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === c.key
                ? "border border-accent bg-accent/10 text-accent"
                : "border border-border text-text-muted hover:border-border-strong hover:text-text-primary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {filtered.map((r) => (
          <RoadmapCard key={r.slug} data={r} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-text-muted">
          {!loaded || retrying
            ? retrying
              ? "Waking up the server — this can take up to a couple of minutes on a cold start…"
              : "Loading roadmaps…"
            : "No roadmaps in this category yet."}
        </p>
      )}

      <AdSlot placement="native_block" className="mt-10" />

      <p className="mt-10 text-center text-sm">
        <Link to="/" className="text-accent hover:text-accent-hover">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
