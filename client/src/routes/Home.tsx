import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import LineDiagram from "../components/roadmap/LineDiagram";
import RoadmapCard, { RoadmapCardData } from "../components/roadmap/RoadmapCard";
import AdSlot from "../components/ads/AdSlot";
import AdsterraSlot from "../components/ads/AdsterraSlot";
import { RoadmapCategory } from "../data/sampleRoadmaps";
import { useAdminStore } from "../store/adminStore";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const categories: { key: RoadmapCategory | "all"; label: string }[] = [
  { key: "all", label: "All lines" },
  { key: "tech", label: "Tech" },
  { key: "exam", label: "Exam prep" },
  { key: "school", label: "School (11–12)" },
  { key: "skill", label: "Skill" },
];

// Updated array to match the required properties for your UI
const journeySteps = [
  {
    number: "01",
    label: "START",
    icon: "🎯",
    title: "Choose a goal",
    body: "Pick a skill or target role — DSA, Full Stack, or a specific company’s prep track.",
  },
  {
    number: "02",
    label: "PATH",
    icon: "🛤️",
    title: "Follow the route",
    body: "A sequenced line of topics with clear prerequisites. No guesswork.",
  },
  {
    number: "03",
    label: "LEARN",
    icon: "📺",
    title: "Watch curated resources",
    body: "The best free video, article, or doc for each stop — never a random search result.",
  },
  {
    number: "04",
    label: "WORK",
    icon: "💻",
    title: "Practice",
    body: "MCQs, coding problems, and concept checks tied to the topic you just learned.",
  },
  {
    number: "05",
    label: "METRICS",
    icon: "📊",
    title: "Track progress",
    body: "Every roadmap shows exactly how far along the line you are.",
  },
  {
    number: "06",
    label: "FINISH",
    icon: "🚀",
    title: "Reach the terminus",
    body: "Job-ready mode: DSA, projects, resume, interview prep — all mapped out.",
  },
];

export default function Home() {
  useDocumentMeta({
    title: "RouteMap",
    description:
      "Free educational content is everywhere. RouteMap charts it into a clear route, station by station, so you always know the next stop. Roadmaps for DSA, Full Stack, exam prep, and more — all free.",
    path: "/",
  });

  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<RoadmapCategory | "all">("all");

  // Added state for the Journey section
  const [activeStop, setActiveStop] = useState(0);

  const adminRoadmaps = useAdminStore((s) => s.roadmaps);
  const loaded = useAdminStore((s) => s.loaded);
  const retrying = useAdminStore((s) => s.retrying);

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

  const filteredRoadmaps = useMemo(
    () =>
      activeCategory === "all"
        ? roadmaps
        : roadmaps.filter((r) => r.category === activeCategory),
    [activeCategory, roadmaps]
  );

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.35] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl"
        />

        <div className="container-page relative pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-[11px] font-medium tracking-wide text-text-muted backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                A route map for the internet’s free courses
              </div>

              <h1 className="font-display text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-[3.25rem]">
                Stop searching.
                <br />
                <span className="text-accent">Start learning.</span>
              </h1>

              <p className="mt-5 max-w-[28rem] text-[15px] leading-relaxed text-text-muted">
                Free educational content is everywhere. We chart it into a clear
                route, station by station, so you always know the next stop.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                }}
                className="mt-9 flex max-w-md items-center gap-1.5 rounded-xl border border-border bg-surface p-1.5 shadow-sm transition focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/15"
              >
                <svg
                  className="ml-2.5 h-4 w-4 shrink-0 text-text-faint"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Try "DSA", "Java", "React", "SQL"…'
                  className="w-full bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-text-primary px-5 py-2.5 text-sm font-semibold text-ink transition hover:opacity-85 active:scale-[0.98]"
                >
                  Find a skill
                </button>
              </form>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/roadmaps"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
                >
                  Explore roadmaps
                  <span aria-hidden className="text-text-faint">
                    →
                  </span>
                </Link>
                <span className="text-xs text-text-faint">
                  No signup needed to start
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/20 via-transparent to-transparent opacity-60" />
              <div className="relative flex justify-center rounded-2xl border border-border bg-surface/90 p-6 shadow-sm backdrop-blur-sm lg:p-8">
                <LineDiagram />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular roadmaps ─────────────────────────────────── */}
      <section className="border-t border-border bg-surface/30 py-20">
        <div className="container-page">
          <AdsterraSlot className="mb-12" />

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-text-faint">
                The lines
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.7rem]">
                Popular roadmaps
              </h2>
            </div>
            <Link
              to="/roadmaps"
              className="hidden text-sm font-medium text-accent transition hover:text-accent-hover sm:inline-flex sm:items-center sm:gap-1"
            >
              View all lines
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((c) => {
              const isActive = activeCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-accent text-white shadow-sm shadow-accent/25"
                      : "border border-border bg-surface text-text-muted hover:border-border-strong hover:text-text-primary"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {filteredRoadmaps.map((r) => (
              <RoadmapCard key={r.slug} data={r} />
            ))}
          </div>

          {filteredRoadmaps.length === 0 && (
            <p className="py-16 text-center text-sm text-text-muted">
              {!loaded || retrying
                ? retrying
                  ? "Waking up the server — this can take up to a couple of minutes on a cold start…"
                  : "Loading roadmaps…"
                : "No roadmaps in this category yet."}
            </p>
          )}

          <p className="mt-8 max-w-2xl text-xs leading-relaxed text-text-faint">
            Popular free full batches (e.g. well-known DSA / web-dev batches,
            exam-prep channels, school-batch playlists) are curated inside each
            roadmap’s topics as resource options — credited to their original
            creator, never re-hosted.
          </p>

          <div className="mt-6 sm:hidden">
            <Link
              to="/roadmaps"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              View all lines →
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="relative border-t border-border bg-background py-20 sm:py-28">
        <div className="container-page">
          <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">
            {/* Sticky Left Column */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-mono text-[9px] tracking-[0.22em] text-accent">
                02 / THE JOURNEY
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Six moves.
                <br />
                <span className="text-text-faint">One destination.</span>
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-text-muted">
                The product is simple: remove uncertainty from learning. Every
                step exists to make the next one obvious.
              </p>

              {/* Progress Indicator */}
              <div className="mt-8 hidden rounded-2xl border border-border bg-surface p-5 lg:block shadow-sm">
                <div className="flex items-center justify-between text-[10px] font-mono text-text-faint">
                  <span>PROGRESS</span>
                  <span>{String(activeStop + 1).padStart(2, "0")} / 06</span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border/50">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-700 ease-in-out"
                    style={{ width: `${((activeStop + 1) / 6) * 100}%` }}
                  />
                </div>
                <p className="mt-4 text-sm font-medium text-text-primary">
                  {journeySteps[activeStop].title}
                </p>
              </div>
            </div>

            {/* Interactive Right Column */}
            <div className="relative">
              {/* Vertical Line Connector */}
              <div className="absolute bottom-10 left-[27px] top-10 w-px bg-border/60" />

              <div className="space-y-4">
                {journeySteps.map((step, i) => {
                  const active = activeStop === i;

                  return (
                    <button
                      key={step.number}
                      type="button"
                      onClick={() => setActiveStop(i)}
                      className={`group relative w-full rounded-2xl border p-5 text-left transition-all duration-300 sm:p-7 ${
                        active
                          ? "border-accent/40 bg-surface shadow-xl shadow-accent/5 ring-1 ring-accent/10"
                          : "border-transparent bg-transparent hover:border-border hover:bg-surface/30"
                      }`}
                    >
                      <div className="relative z-10 flex gap-5 sm:gap-7">
                        {/* Step Icon/Number */}
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-background font-mono text-xs transition-all duration-300 ${
                            active
                              ? "border-accent text-accent shadow-lg shadow-accent/20 scale-110"
                              : "border-border text-text-faint group-hover:border-accent/50"
                          }`}
                        >
                          {active ? step.icon : step.number}
                        </div>

                        {/* Text Content */}
                        <div className="min-w-0 flex-1 py-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-[9px] font-semibold tracking-[0.2em] text-accent">
                              {step.label}
                            </span>
                            {active && (
                              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[9px] font-medium text-accent">
                                CURRENT STOP
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
                            {step.title}
                          </h3>

                          {/* Expandable Body */}
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              active
                                ? "grid-rows-[1fr] opacity-100 mt-2"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <p className="overflow-hidden max-w-xl text-sm leading-relaxed text-text-muted">
                              {step.body}
                            </p>
                          </div>
                        </div>

                        {/* Arrow Indicator */}
                        <span
                          className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm transition-all duration-300 sm:flex ${
                            active
                              ? "border-accent bg-accent text-white translate-x-1"
                              : "border-border text-text-faint group-hover:border-accent/40 group-hover:text-accent"
                          }`}
                        >
                          →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Native ad ────────────────────────────────────────── */}
      <section className="border-t border-border py-10">
        <div className="container-page">
           <AdSlot placement="native_block" /> 
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
       <section className="py-20 sm:py-32">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-surface px-6 py-16 text-center sm:px-12 sm:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
            />

            <div className="relative">
              <p className="font-mono text-[9px] tracking-[0.25em] text-accent">
                FINAL DESTINATION
              </p>

              <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-6xl">
                Don't collect tutorials.
                <br />
                <span className="text-text-faint">Collect progress.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
                Pick one route today. Take the first stop. Let momentum do the
                rest.
              </p>

              <Link
                to="/roadmaps"
                className="group mt-9 inline-flex items-center gap-3 rounded-full bg-text-primary px-6 py-3.5 text-sm font-semibold text-ink shadow-xl transition-all hover:-translate-y-1 hover:opacity-85"
              >
                Start your journey
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
