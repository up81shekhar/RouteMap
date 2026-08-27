import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ResourceCard from "../components/resource/ResourceCard";
import PracticeQuiz from "../components/practice/PracticeQuiz";
import AdSlot from "../components/ads/AdSlot";
import { getStaticTopicContent } from "../data/sampleRoadmaps";
import { useProgressStore } from "../store/progressStore";
import { useAdminStore } from "../store/adminStore";
import * as practiceApi from "../api/practice";
import { ApiPracticeQuestion } from "../api/practice";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useJsonLd } from "../hooks/useJsonLd";
import { trackEvent } from "../lib/analytics";

// Local fallback so the flagship Arrays example still has practice questions
// in offline/demo mode, consistent with how its resources also fall back.
const DEMO_ARRAYS_PRACTICE: ApiPracticeQuestion[] = [
  {
    _id: "demo-1", type: "mcq", difficulty: "easy",
    prompt: "What is the time complexity of accessing an element by index in an array?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correctAnswer: "O(1)",
    explanation: "Arrays store elements in contiguous memory, so the address of any index can be computed directly.",
  },
  {
    _id: "demo-2", type: "mcq", difficulty: "easy",
    prompt: "What is the time complexity of inserting an element at the beginning of an array?",
    options: ["O(1)", "O(n)", "O(log n)", "O(1) amortized"], correctAnswer: "O(n)",
    explanation: "Every existing element has to shift one position to make room, which takes linear time.",
  },
  {
    _id: "demo-3", type: "mcq", difficulty: "medium",
    prompt: "Which technique finds a pair with a target sum in a sorted array in O(n) time?",
    options: ["Two pointer", "Binary search per element", "Nested loops", "Hashing only"], correctAnswer: "Two pointer",
    explanation: "Two pointers starting at both ends move inward based on the current sum vs target, giving a single O(n) pass.",
  },
];

export default function TopicDetail() {
  const { roadmapSlug, slug } = useParams();

  const roadmap = useAdminStore((s) => s.roadmaps.find((r) => r.slug === roadmapSlug));
  const loadRoadmapDetail = useAdminStore((s) => s.loadRoadmapDetail);
  const loadTopicResources = useAdminStore((s) => s.loadTopicResources);
  const node = roadmap?.nodes.find((n) => n.slug === slug);
  const topicKey = `${roadmapSlug}/${slug}`;
  const resources = useAdminStore((s) => s.topicResources[topicKey] ?? []);

  const isOffline = useAdminStore((s) => s.isOffline);
  const retrying = useAdminStore((s) => s.retrying);
  const loaded = useAdminStore((s) => s.loaded);
  const [practiceQuestions, setPracticeQuestions] = useState<ApiPracticeQuestion[]>([]);

  useEffect(() => {
    if (roadmapSlug) void loadRoadmapDetail(roadmapSlug);
    if (roadmapSlug && slug) void loadTopicResources(roadmapSlug, slug);
    // Re-run once the backend recovers from a cold start (isOffline flips
    // false), so this page picks up real data instead of staying stuck on
    // whatever the offline placeholder had.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapSlug, slug, isOffline]);

  useEffect(() => {
    if (!roadmapSlug || !slug) return;
    if (isOffline) {
      setPracticeQuestions(roadmapSlug === "dsa" && slug === "arrays" ? DEMO_ARRAYS_PRACTICE : []);
      return;
    }
    practiceApi
      .getPractice(roadmapSlug, slug)
      .then(({ questions }) => setPracticeQuestions(questions))
      .catch(() => setPracticeQuestions(roadmapSlug === "dsa" && slug === "arrays" ? DEMO_ARRAYS_PRACTICE : []));
  }, [roadmapSlug, slug, isOffline]);

  const staticContent = useMemo(
    () =>
      roadmapSlug && slug && node
        ? getStaticTopicContent(roadmapSlug, slug, node.title, node.contentSource)
        : undefined,
    [roadmapSlug, slug, node]
  );
  const lessons = useMemo(() => staticContent?.lessons ?? [], [staticContent]);

  useDocumentMeta({
    title: node && roadmap ? `${node.title} — ${roadmap.title}` : "Lesson",
    description:
      node && roadmap
        ? `Learn ${node.title} as part of the free ${roadmap.title} roadmap on RouteMap — curated videos, articles, and practice, all free.`
        : undefined,
    path: `/roadmaps/${roadmapSlug}/${slug}`,
  });

  useJsonLd(
    node && roadmap
      ? {
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: node.title,
          description: `${node.title} — part of the ${roadmap.title} roadmap`,
          isPartOf: { "@type": "Course", name: roadmap.title },
          isAccessibleForFree: true,
          learningResourceType: "lesson",
        }
      : null
  );

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

  // Whole-topic fallback video (no lessonIndex set) — used when the current
  // lesson step has no video of its own.
  const primaryResource = useMemo(
    () => resources.find((r) => r.tag === "recommended" && r.type === "video" && r.lessonIndex == null),
    [resources]
  );
  // A video specifically curated for the lesson step currently selected in
  // the sidebar — this takes priority so each step can show its own video.
  const lessonResource = useMemo(
    () => resources.find((r) => r.type === "video" && r.lessonIndex === currentIndex),
    [resources, currentIndex]
  );
  const otherResources = resources.filter((r) => r.id !== primaryResource?.id && r.id !== lessonResource?.id);
  const viewingResource = resources.find((r) => r.id === viewingResourceId);
  const activeVideoIdForTracking =
    viewingResource?.videoId ?? lessonResource?.videoId ?? currentLesson?.videoId ?? primaryResource?.videoId;

  useEffect(() => {
    if (roadmap && node) trackEvent("topic_opened", { roadmap_slug: roadmap.slug, topic_slug: node.slug, topic_title: node.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmap?.slug, node?.slug]);

  useEffect(() => {
    if (roadmap && node && activeVideoIdForTracking) {
      trackEvent("video_started", { roadmap_slug: roadmap.slug, topic_slug: node.slug, video_id: activeVideoIdForTracking });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideoIdForTracking]);

  if (!roadmap || !node || !staticContent) {
    if (!loaded || retrying) {
      return (
        <div className="container-page py-24 text-center">
          <p className="station-code mb-3">{retrying ? "Waking up the server" : "Loading"}</p>
          <h1 className="font-display text-2xl">
            {retrying ? "This can take up to a couple of minutes on a cold start…" : "Loading this lesson…"}
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            Free hosting spins down when idle. Hang tight — this only happens on the first visit in a while.
          </p>
        </div>
      );
    }
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
    trackEvent("lesson_completed", {
      roadmap_slug: roadmap!.slug,
      topic_slug: node!.slug,
      lesson_index: currentIndex,
      lesson_title: currentLesson?.title,
    });
    setViewingResourceId(null);
    if (!isLastLesson) setCurrentIndex((i) => i + 1);
  }

  function goTo(index: number) {
    if (index <= maxUnlockedIndex) {
      setCurrentIndex(index);
      setViewingResourceId(null);
    }
  }

  const activeVideoId =
    viewingResource?.videoId ?? lessonResource?.videoId ?? currentLesson?.videoId ?? primaryResource?.videoId;
  const progressPercent = lessons.length ? Math.round((completedArr.length / lessons.length) * 100) : 0;

  const sortedNodes = [...roadmap.nodes];
  const currentNodeIndex = sortedNodes.findIndex((n) => n.slug === node.slug);
  const nextNode = currentNodeIndex >= 0 ? sortedNodes[currentNodeIndex + 1] : undefined;

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
            <div className="h-1.5 rounded-full bg-lime" style={{ width: `${progressPercent}%` }} />
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              <span>Topic complete.</span>
              {nextNode ? (
                <Link
                  to={`/roadmaps/${roadmap.slug}/${nextNode.slug}`}
                  className="rounded-full bg-success px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                >
                  Next: {nextNode.title} →
                </Link>
              ) : (
                <Link
                  to={`/roadmaps/${roadmap.slug}`}
                  className="rounded-full bg-success px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                >
                  You finished the line 🎉 View summary →
                </Link>
              )}
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

          {practiceQuestions.length > 0 && (
            <div className="mt-10">
              <p className="station-code mb-3">Practice</p>
              <PracticeQuiz questions={practiceQuestions} context={{ roadmapSlug: roadmap.slug, nodeSlug: node.slug }} />
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