import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import * as adminApi from "../../api/admin";
import { LineColor, RoadmapCategory } from "../../data/sampleRoadmaps";

const categories: RoadmapCategory[] = ["tech", "exam", "school", "skill"];
const colors: LineColor[] = ["coral", "teal", "violet", "amber"];
const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;

export default function AdminPlaylistImport() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [playlistUrl, setPlaylistUrl] = useState("");
  const [category, setCategory] = useState<RoadmapCategory>("tech");
  const [color, setColor] = useState<LineColor>("coral");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("Beginner");
  const [titleOverride, setTitleOverride] = useState("");
  const [descriptionOverride, setDescriptionOverride] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setStatus("loading");
    setError(null);
    try {
      const { roadmap, videosImported } = await adminApi.importPlaylist(
        {
          playlistUrl,
          category,
          color,
          difficulty,
          title: titleOverride || undefined,
          description: descriptionOverride || undefined,
        },
        accessToken
      );
      navigate(`/admin/roadmaps/${roadmap.slug}`, {
        state: { justImported: videosImported },
      });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong importing that playlist.");
    }
  }

  return (
    <div className="max-w-xl">
      <p className="station-code mb-3">New course</p>
      <h1 className="font-display text-2xl font-semibold">Import from a YouTube playlist</h1>
      <p className="mt-2 text-sm text-text-muted">
        Paste a playlist link — every video becomes its own station with its real title, in playlist
        order. No manual lesson steps needed for these.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">Playlist URL</label>
          <input
            required
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            placeholder="https://www.youtube.com/playlist?list=..."
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RoadmapCategory)}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Line color</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value as LineColor)}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm"
            >
              {colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as (typeof difficulties)[number])}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Course title <span className="text-text-faint">(optional — defaults to the playlist's title)</span>
          </label>
          <input
            value={titleOverride}
            onChange={(e) => setTitleOverride(e.target.value)}
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Description <span className="text-text-faint">(optional — defaults to the playlist's description)</span>
          </label>
          <textarea
            value={descriptionOverride}
            onChange={(e) => setDescriptionOverride(e.target.value)}
            rows={3}
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Importing playlist…" : "Import playlist"}
        </button>
        <p className="text-xs text-text-faint">
          Large playlists can take a little while — we fetch every video's title and duration from
          YouTube before creating the course. The course is created unpublished so you can review it first.
        </p>
      </form>
    </div>
  );
}
