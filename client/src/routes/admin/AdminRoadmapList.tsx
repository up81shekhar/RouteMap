import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/adminStore";

export default function AdminRoadmapList() {
  const roadmaps = useAdminStore((s) => s.roadmaps);
  const loadRoadmaps = useAdminStore((s) => s.loadRoadmaps);
  const togglePublish = useAdminStore((s) => s.togglePublish);
  const deleteRoadmap = useAdminStore((s) => s.deleteRoadmap);
  const addRoadmap = useAdminStore((s) => s.addRoadmap);
  const navigate = useNavigate();
  const [settingUpPlacements, setSettingUpPlacements] = useState(false);

  useEffect(() => {
    void loadRoadmaps();
  }, [loadRoadmaps]);

  async function handleDelete(slug: string, title: string) {
    if (confirm(`Delete "${title}"? This removes all its topics and curated resources.`)) {
      await deleteRoadmap(slug);
    }
  }

  // The navbar's "Placements" link always points at /roadmaps/placement-prep —
  // it only 404s because that exact roadmap hasn't been created yet. This is
  // a one-click, no-typos way to create it instead of relying on typing the
  // title exactly right in the generic "New roadmap" form.
  const hasPlacementsRoadmap = roadmaps.some((r) => r.slug === "placement-prep");

  async function handleSetupPlacements() {
    setSettingUpPlacements(true);
    try {
      const slug = await addRoadmap({
        title: "Placement Prep",
        description: "Interview prep, resume tips, and placement-focused practice — free and structured.",
        difficulty: "Intermediate",
        category: "skill",
        color: "violet",
        estimatedDurationHours: 20,
        prerequisites: [],
        careerOutcomes: [],
      });
      navigate(`/admin/roadmaps/${slug}`);
    } finally {
      setSettingUpPlacements(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Roadmaps</h1>
        <div className="flex gap-2">
          {!hasPlacementsRoadmap && (
            <button
              onClick={handleSetupPlacements}
              disabled={settingUpPlacements}
              className="rounded border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {settingUpPlacements ? "Setting up…" : "Set up Placements page"}
            </button>
          )}
          <Link
            to="/admin/import-playlist"
            className="rounded border border-border px-4 py-2 text-sm font-medium text-text-primary hover:border-accent hover:text-accent"
          >
            Import from playlist
          </Link>
          <Link
            to="/admin/roadmaps/new"
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            + New roadmap
          </Link>
        </div>
      </div>

      {!hasPlacementsRoadmap && (
        <div className="mb-6 rounded-card border border-accent/30 bg-accent/5 p-4 text-sm">
          <p className="font-medium text-text-primary">The navbar's "Placements" link isn't set up yet</p>
          <p className="mt-1 text-text-muted">
            It points to a roadmap that doesn't exist yet, so visitors get a 404. Click "Set up Placements page"
            above to create it — you can add topics to it right after, same as any other roadmap.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-text-faint">
              <th className="px-4 py-3 font-normal">Line</th>
              <th className="px-4 py-3 font-normal">Title</th>
              <th className="px-4 py-3 font-normal">Category</th>
              <th className="px-4 py-3 font-normal">Stations</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roadmaps.map((r) => (
              <tr key={r.slug} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-text-muted">{r.lineCode}</td>
                <td className="px-4 py-3">
                  <Link to={`/admin/roadmaps/${r.slug}`} className="font-medium text-text-primary hover:text-accent">
                    {r.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-muted capitalize">{r.category}</td>
                <td className="px-4 py-3 text-text-muted">{r.nodes.length}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => togglePublish(r.slug)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      r.isPublished ? "bg-success/15 text-success" : "bg-border text-text-muted"
                    }`}
                  >
                    {r.isPublished ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/admin/roadmaps/${r.slug}`} className="mr-3 text-xs text-accent hover:text-accent-hover">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(r.slug, r.title)}
                    className="text-xs text-danger hover:opacity-80"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
