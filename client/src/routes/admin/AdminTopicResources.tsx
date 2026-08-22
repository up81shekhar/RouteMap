import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAdminStore } from "../../store/adminStore";
import { ResourceTag, ResourceType, getStaticTopicContent } from "../../data/sampleRoadmaps";

export default function AdminTopicResources() {
  const { roadmapSlug, nodeSlug } = useParams();
  const roadmap = useAdminStore((s) => s.roadmaps.find((r) => r.slug === roadmapSlug));
  const loadRoadmapDetail = useAdminStore((s) => s.loadRoadmapDetail);
  const loadTopicResources = useAdminStore((s) => s.loadTopicResources);
  const node = roadmap?.nodes.find((n) => n.slug === nodeSlug);
  const key = `${roadmapSlug}/${nodeSlug}`;
  const resources = useAdminStore((s) => s.topicResources[key] ?? []);
  const addResource = useAdminStore((s) => s.addResource);
  const deleteResource = useAdminStore((s) => s.deleteResource);

  const [type, setType] = useState<ResourceType>("video");
  const [tag, setTag] = useState<ResourceTag>("recommended");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [language, setLanguage] = useState<"English" | "Hindi" | "Hinglish">("English");
  const [videoId, setVideoId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">("");
  const [lessonIndex, setLessonIndex] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  const lessons = roadmapSlug && nodeSlug && node
    ? getStaticTopicContent(roadmapSlug, nodeSlug, node.title).lessons
    : [];

  useEffect(() => {
    if (roadmapSlug) void loadRoadmapDetail(roadmapSlug);
    if (roadmapSlug && nodeSlug) void loadTopicResources(roadmapSlug, nodeSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapSlug, nodeSlug]);

  if (!roadmap || !node) {
    return (
      <div>
        <p className="text-sm text-text-muted">Loading station…</p>
        <Link to="/admin" className="mt-2 inline-block text-sm text-accent">← Back to roadmaps</Link>
      </div>
    );
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !source.trim()) return;
    setSubmitting(true);
    try {
      await addResource(key, {
        type,
        tag,
        title: title.trim(),
        source: source.trim(),
        language,
        videoId: type === "video" ? videoId.trim() || undefined : undefined,
        durationMinutes: durationMinutes === "" ? undefined : durationMinutes,
        lessonIndex: type === "video" && lessonIndex !== "" ? lessonIndex : undefined,
      });
      setTitle("");
      setSource("");
      setVideoId("");
      setDurationMinutes("");
      setLessonIndex("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="station-code mb-3">
        <Link to="/admin" className="hover:text-text-primary">Roadmaps</Link> /{" "}
        <Link to={`/admin/roadmaps/${roadmap.slug}`} className="hover:text-text-primary">{roadmap.title}</Link> / {node.title}
      </p>
      <h1 className="mb-6 font-display text-2xl font-semibold">Resources — {node.title}</h1>

      <ul className="mb-8 space-y-2">
        {resources.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3">
            <span className="font-mono text-[10px] uppercase text-accent w-24 shrink-0">{r.tag}</span>
            <span className="flex-1 truncate text-sm text-text-primary">{r.title}</span>
            {typeof r.lessonIndex === "number" && (
              <span className="rounded bg-ink px-2 py-0.5 text-[10px] text-text-muted shrink-0">
                {lessons[r.lessonIndex]?.title ?? `Step ${r.lessonIndex + 1}`}
              </span>
            )}
            <span className="text-xs text-text-muted">{r.source} · {r.language}</span>
            <button onClick={() => deleteResource(key, r.id)} className="text-xs text-danger hover:opacity-80">Remove</button>
          </li>
        ))}
        {resources.length === 0 && (
          <p className="text-sm text-text-faint">No curated resources yet — add one below. The topic page will show a "being curated" placeholder until then.</p>
        )}
      </ul>

      <form onSubmit={handleAdd} className="space-y-4 rounded-card border border-dashed border-border p-5">
        <div className="grid grid-cols-2 gap-4">
          <select value={type} onChange={(e) => setType(e.target.value as ResourceType)} className={inputCls}>
            <option value="video">Video (official YouTube embed)</option>
            <option value="article">Article</option>
            <option value="practice">Practice</option>
          </select>
          <select value={tag} onChange={(e) => setTag(e.target.value as ResourceTag)} className={inputCls}>
            <option value="recommended">Recommended</option>
            <option value="alternative">Alternative</option>
            <option value="quick">Quick revision</option>
            <option value="deep_dive">Deep dive</option>
            <option value="hindi">Hindi</option>
          </select>
        </div>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title" className={inputCls} />
        <div className="grid grid-cols-2 gap-4">
          <input required value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source / channel, e.g. Apna College" className={inputCls} />
          <select value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} className={inputCls}>
            <option>English</option>
            <option>Hindi</option>
            <option>Hinglish</option>
          </select>
        </div>
        {type === "video" && (
          <div className="grid grid-cols-2 gap-4">
            <input
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="YouTube video ID (e.g. dQw4w9WgXcQ)"
              className={inputCls}
            />
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Duration (minutes)"
              className={inputCls}
            />
            <select
              value={lessonIndex}
              onChange={(e) => setLessonIndex(e.target.value === "" ? "" : Number(e.target.value))}
              className={`${inputCls} col-span-2`}
            >
              <option value="">Applies to whole topic (fallback / "More resources")</option>
              {lessons.map((lesson, i) => (
                <option key={lesson.title} value={i}>
                  Only for lesson: {String(i + 1).padStart(2, "0")} {lesson.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" disabled={submitting} className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
          {submitting ? "Adding…" : "+ Add resource"}
        </button>
        <p className="text-xs text-text-faint">
          Only paste video IDs from videos whose creator allows embedding — we never download or re-host, only embed via the official player and credit the source.
        </p>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded border border-border bg-ink px-3 py-2 text-sm text-text-primary outline-none focus:border-accent";
