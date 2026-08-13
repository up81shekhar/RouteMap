import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAdminStore } from "../../store/adminStore";

export default function AdminRoadmapList() {
  const roadmaps = useAdminStore((s) => s.roadmaps);
  const loadRoadmaps = useAdminStore((s) => s.loadRoadmaps);
  const togglePublish = useAdminStore((s) => s.togglePublish);
  const deleteRoadmap = useAdminStore((s) => s.deleteRoadmap);

  useEffect(() => {
    void loadRoadmaps();
  }, [loadRoadmaps]);

  async function handleDelete(slug: string, title: string) {
    if (confirm(`Delete "${title}"? This removes all its topics and curated resources.`)) {
      await deleteRoadmap(slug);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Roadmaps</h1>
        <Link
          to="/admin/roadmaps/new"
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          + New roadmap
        </Link>
      </div>

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
