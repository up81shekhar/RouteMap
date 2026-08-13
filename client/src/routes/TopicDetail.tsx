import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ResourceCard from "../components/resource/ResourceCard";
import AdSlot from "../components/ads/AdSlot";
import { getStaticTopicContent } from "../data/sampleRoadmaps";
import { useProgressStore } from "../store/progressStore";
import { useAdminStore } from "../store/adminStore";

export default function TopicDetail() {
  const { roadmapSlug, slug } = useParams();

  const roadmap = useAdminStore((s) => s.roadmaps.find((r) => r.slug === roadmapSlug));
  const loadRoadmapDetail = useAdminStore((s) => s.loadRoadmapDetail);
  const loadTopicResources = useAdminStore((s) => s.loadTopicResources);
  const node = roadmap?.nodes.find((n) => n.slug === slug);
  const topicKey = `${roadmapSlug}/${slug}`;
  const resources = useAdminStore((s) => s.topicResources[topicKey] ?? []);

  useEffect(() => {
    if (roadmapSlug) void loadRoadmapDetail(roadmapSlug);
    if (roadmapSlug && slug) void loadTopicResources(roadmapSlug, slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapSlug, slug]);

  const staticContent = useMemo(
    () => (roadmapSlug && slug && node ? getStaticTopicContent(roadmapSlug, slug, node.title) : undefined),
    [roadmapSlug, slug, node]
  );
  const lessons = useMemo(() => staticContent?.lessons ?? [], [staticContent]);

  const progressKey = topicKey;
  const completedArr = useProgressStore((s) => s.getCompleted(progressKey));
  const markComplete = useProgressStore((s) => s.markComplete);
  const syncFromServer = useProgressStore((s) => s.syncFromServer);
  const completed = useMemo(() => new Set(completedArr), [completedArr]);

  useEffect(() => {
    if (roadmapSlug && slug) void syncFromServer(roadmapSlug, slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapSlug, slug]);

  const [currentIndex, setCurrentIndex] = useState(0);
  // When set, the player shows this resource instead of the current lesson's video.
  const [viewingResourceId, setViewingResourceId] = useState<string | null>(null);

  const currentLesson = lessons[currentIndex];
  const maxUnlockedIndex = Math.min(completedArr.length, Math.max(lessons.length - 1, 0));

  const primaryResource = useMemo(
    () => resources.find((r) => r.tag === "recommended" && r.type === "video"),
    [resources]
  );
  const otherResources = resources.filter((r) => r.id !== primaryResource?.id);
  const viewingResource = resources.find((r) => r.id === viewingResourceId);

  if (!roadmap || !node || !staticContent) {
    return (
      <div className="container-page py-24 text-center">
        <p className="station-code mb-3">Topic not found</p>
        <h1 className="font-display text-2xl">We couldn't find that lesson.</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-accent hover:text-accent-hover">
          ← Back to all lines
        </Link>
      </div>
    );
  }

  const isLastLesson = currentIndex === lessons.length - 1;
  const isCurrentDone = completed.has(currentIndex);

  function handleMarkComplete() {
    markComplete(progressKey, currentIndex);
    setViewingResourceId(null);
    if (!isLastLesson) setCurrentIndex((i) => i + 1);
  }

  function goTo(index: number) {
    if (index <= maxUnlockedIndex) {
      setCurrentIndex(index);
      setViewingResourceId(null);
    }
  }

  const activeVideoId = viewingResource?.videoId ?? currentLesson?.videoId ?? primaryResource?.videoId;
  const progressPercent = lessons.length ? Math.round((completedArr.length / lessons.length) * 100) : 0;

  return (
    <div className="container-page py-12">
      <p className="station-code mb-3">
        <Link to="/" className="hover:text-text-primary">Roadmaps</Link> /{" "}
        <Link to={`/roadmaps/${roadmap.slug}`} className="hover:text-text-primary">{roadmap.title}</Link> /{" "}
        {node.title}
      </p>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{node.title}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {roadmap.difficulty} · Estimated {node.estimatedHours} hours
            {staticContent.prerequisites.length ? ` · Prerequisites: ${staticContent.prerequisites.join(", ")}` : ""}
          </p>
        </div>
        <div className="min-w-[160px]">
          <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-40 rounded-full bg-border">
            <div className="h-1.5 rounded-full bg-line-coral" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Main: player + learning path + resources */}
        <div>
          {activeVideoId ? (
            <div className="aspect-video w-full overflow-hidden rounded-card border border-border bg-black">
              <iframe
                key={activeVideoId + (viewingResource?.id ?? currentIndex)}
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}`}
                title={viewingResource?.title ?? currentLesson?.title ?? node.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border bg-surface text-center">
              <p className="text-sm text-text-muted">Video resources for this station are being curated.</p>
              <p className="text-xs text-text-faint">Check back soon, or explore Arrays in the DSA line for a fully curated example.</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              {viewingResource ? (
                <>Watching alternative: <span className="text-text-primary">{viewingResource.title}</span>{" "}
                  <span className="text-text-faint">· {viewingResource.source}</span>{" "}
                  <button onClick={() => setViewingResourceId(null)} className="ml-1 text-accent hover:text-accent-hover">
                    Back to lesson
                  </button>
                </>
              ) : isCurrentDone ? (
                <span className="text-success">Lesson completed ✓</span>
              ) : (
                <>Now playing: <span className="text-text-primary">{currentLesson?.title}</span></>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="rounded border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>
              <button
                onClick={handleMarkComplete}
                disabled={isCurrentDone && isLastLesson}
                className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLastLesson && isCurrentDone ? "All done" : "Mark complete"}
              </button>
              <button
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex >= maxUnlockedIndex || isLastLesson}
                className="rounded border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>

          {progressPercent === 100 && (
            <div className="mt-4 rounded-card border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              Topic complete. Continue to the next station from the roadmap line.
            </div>
          )}

          <div className="mt-10">
            <p className="station-code mb-3">What you will learn</p>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-text-muted sm:grid-cols-2">
              {staticContent.whatYouWillLearn.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-line-coral">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <AdSlot placement="native_block" className="mt-10" />

          {otherResources.length > 0 && (
            <div className="mt-10">
              <p className="station-code mb-3">More resources for this topic</p>
              <p className="mb-4 text-xs text-text-faint">
                Multiple free sources, so you can pick what fits — always credited to the original creator. Click a video to play it above.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {otherResources.map((r) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    active={r.id === viewingResourceId}
                    onClick={() => setViewingResourceId(r.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: lesson checklist */}
        <aside>
          <p className="station-code mb-3">{node.title}</p>
          <ol className="space-y-1">
            {lessons.map((lesson, i) => {
              const isDone = completed.has(i);
              const isCurrent = i === currentIndex && !viewingResource;
              const isLocked = i > maxUnlockedIndex;
              return (
                <li key={lesson.title}>
                  <button
                    onClick={() => goTo(i)}
                    disabled={isLocked}
                    className={`flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-sm ${
                      isCurrent ? "bg-surface text-text-primary" : isLocked ? "text-text-faint" : "text-text-muted hover:text-text-primary"
                    } ${isLocked ? "cursor-not-allowed" : ""}`}
                  >
                    <span className="w-4 shrink-0 font-mono text-xs">
                      {isDone ? "✓" : isCurrent ? "▶" : "○"}
                    </span>
                    {String(i + 1).padStart(2, "0")} {lesson.title}
                  </button>
                </li>
              );
            })}
          </ol>

          <AdSlot placement="roadmap_sidebar" className="mt-6" />
        </aside>
      </div>
    </div>
  );
}