import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminStore } from "../../store/adminStore";

export default function AdminRoadmapEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const roadmap = useAdminStore((s) => s.roadmaps.find((r) => r.slug === slug));
  const loadRoadmapDetail = useAdminStore((s) => s.loadRoadmapDetail);
  const updateRoadmap = useAdminStore((s) => s.updateRoadmap);
  const togglePublish = useAdminStore((s) => s.togglePublish);
  const addNode = useAdminStore((s) => s.addNode);
  const deleteNode = useAdminStore((s) => s.deleteNode);
  const moveNode = useAdminStore((s) => s.moveNode);

  const [newTitle, setNewTitle] = useState("");
  const [newHours, setNewHours] = useState(4);
  const [addingNode, setAddingNode] = useState(false);

  useEffect(() => {
    if (slug) void loadRoadmapDetail(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!roadmap) {
    return (
      <div>
        <p className="text-sm text-text-muted">Loading roadmap…</p>
        <Link to="/admin" className="mt-2 inline-block text-sm text-accent">← Back to roadmaps</Link>
      </div>
    );
  }

  async function handleAddNode(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAddingNode(true);
    try {
      await addNode(roadmap!.slug, newTitle.trim(), newHours);
      setNewTitle("");
      setNewHours(4);
    } finally {
      setAddingNode(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="station-code mb-3">
        <Link to="/admin" className="hover:text-text-primary">Roadmaps</Link> / {roadmap.title}
      </p>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{roadmap.title}</h1>
        <button
          onClick={() => togglePublish(roadmap.slug)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            roadmap.isPublished ? "bg-success/15 text-success" : "bg-border text-text-muted"
          }`}
        >
          {roadmap.isPublished ? "Published — click to unpublish" : "Draft — click to publish"}
        </button>
      </div>

      {/* Meta fields */}
      <div className="mb-10 grid grid-cols-2 gap-4 rounded-card border border-border bg-surface p-5">
        <label className="col-span-2 text-sm text-text-muted">
          Description
          <textarea
            value={roadmap.description}
            onChange={(e) => updateRoadmap(roadmap.slug, { description: e.target.value })}
            className="mt-1.5 w-full rounded border border-border bg-ink px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
            rows={2}
          />
        </label>
        <label className="text-sm text-text-muted">
          Estimated hours
          <input
            type="number"
            value={roadmap.estimatedDurationHours}
            onChange={(e) => updateRoadmap(roadmap.slug, { estimatedDurationHours: Number(e.target.value) })}
            className="mt-1.5 w-full rounded border border-border bg-ink px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
          />
        </label>
        <label className="text-sm text-text-muted">
          Difficulty
          <select
            value={roadmap.difficulty}
            onChange={(e) => updateRoadmap(roadmap.slug, { difficulty: e.target.value as typeof roadmap.difficulty })}
            className="mt-1.5 w-full rounded border border-border bg-ink px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>
      </div>

      {/* Node list */}
      <p className="station-code mb-3">Stations ({roadmap.nodes.length})</p>
      <ol className="mb-6 space-y-2">
        {roadmap.nodes.map((node, i) => (
          <li key={node.slug} className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3">
            <span className="w-6 font-mono text-xs text-text-faint">{String(i).padStart(2, "0")}</span>
            <Link to={`/admin/roadmaps/${roadmap.slug}/topics/${node.slug}`} className="flex-1 text-sm text-text-primary hover:text-accent">
              {node.title}
            </Link>
            <Link
              to={`/admin/roadmaps/${roadmap.slug}/topics/${node.slug}/practice`}
              className="shrink-0 text-xs text-text-muted hover:text-accent"
            >
              Practice
            </Link>
            <span className="font-mono text-xs text-text-faint">{node.estimatedHours}h</span>
            <div className="flex gap-1">
              <button onClick={() => moveNode(roadmap.slug, node.slug, "up")} disabled={i === 0} className="rounded px-2 py-1 text-xs text-text-muted hover:text-text-primary disabled:opacity-30">↑</button>
              <button onClick={() => moveNode(roadmap.slug, node.slug, "down")} disabled={i === roadmap.nodes.length - 1} className="rounded px-2 py-1 text-xs text-text-muted hover:text-text-primary disabled:opacity-30">↓</button>
              <button
                onClick={() => confirm(`Remove "${node.title}"?`) && deleteNode(roadmap.slug, node.slug)}
                className="rounded px-2 py-1 text-xs text-danger hover:opacity-80"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {roadmap.nodes.length === 0 && (
          <p className="text-sm text-text-faint">No stations yet — add the first one below.</p>
        )}
      </ol>

      <form onSubmit={handleAddNode} className="flex gap-2 rounded-card border border-dashed border-border p-4">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Station title, e.g. Kubernetes Basics"
          className="flex-1 rounded border border-border bg-ink px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
        />
        <input
          type="number"
          min={1}
          value={newHours}
          onChange={(e) => setNewHours(Number(e.target.value))}
          className="w-20 rounded border border-border bg-ink px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
        />
        <button type="submit" disabled={addingNode} className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
          {addingNode ? "Adding…" : "+ Add"}
        </button>
      </form>

      <button onClick={() => navigate("/admin")} className="mt-8 text-sm text-text-muted hover:text-text-primary">
        ← Back to all roadmaps
      </button>
    </div>
  );
}
