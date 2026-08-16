import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAdminStore } from "../../store/adminStore";
import { useAuthStore } from "../../store/authStore";
import * as practiceApi from "../../api/practice";
import * as adminApi from "../../api/admin";

export default function AdminTopicPractice() {
  const { roadmapSlug, nodeSlug } = useParams();
  const roadmap = useAdminStore((s) => s.roadmaps.find((r) => r.slug === roadmapSlug));
  const loadRoadmapDetail = useAdminStore((s) => s.loadRoadmapDetail);
  const node = roadmap?.nodes.find((n) => n.slug === nodeSlug);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [questions, setQuestions] = useState<practiceApi.ApiPracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<"mcq" | "concept">("mcq");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    if (!roadmapSlug || !nodeSlug) return;
    try {
      const { questions } = await practiceApi.getPractice(roadmapSlug, nodeSlug);
      setQuestions(questions);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (roadmapSlug) void loadRoadmapDetail(roadmapSlug);
    void refresh();
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
    if (!prompt.trim() || !correctAnswer.trim() || !roadmapSlug || !nodeSlug || !accessToken) return;
    setSubmitting(true);
    try {
      await adminApi.addPracticeQuestion(
        {
          roadmapSlug,
          nodeSlug,
          type,
          difficulty,
          prompt: prompt.trim(),
          options: type === "mcq" ? options.split(",").map((o) => o.trim()).filter(Boolean) : [],
          correctAnswer: correctAnswer.trim(),
          explanation: explanation.trim(),
        },
        accessToken
      );
      setPrompt("");
      setOptions("");
      setCorrectAnswer("");
      setExplanation("");
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken || id.startsWith("demo-")) return;
    await adminApi.deletePracticeQuestion(id, accessToken);
    await refresh();
  }

  return (
    <div className="max-w-2xl">
      <p className="station-code mb-3">
        <Link to="/admin" className="hover:text-text-primary">Roadmaps</Link> /{" "}
        <Link to={`/admin/roadmaps/${roadmap.slug}`} className="hover:text-text-primary">{roadmap.title}</Link> /{" "}
        <Link to={`/admin/roadmaps/${roadmap.slug}/topics/${node.slug}`} className="hover:text-text-primary">{node.title}</Link> / Practice
      </p>
      <h1 className="mb-6 font-display text-2xl font-semibold">Practice — {node.title}</h1>

      {loading ? (
        <p className="mb-8 text-sm text-text-muted">Loading…</p>
      ) : (
        <ul className="mb-8 space-y-2">
          {questions.map((q) => (
            <li key={q._id} className="flex items-start gap-3 rounded-card border border-border bg-surface px-4 py-3">
              <span className="mt-0.5 font-mono text-[10px] uppercase text-accent w-14 shrink-0">{q.difficulty}</span>
              <span className="flex-1 text-sm text-text-primary">{q.prompt}</span>
              <button onClick={() => handleDelete(q._id)} className="shrink-0 text-xs text-danger hover:opacity-80">
                Remove
              </button>
            </li>
          ))}
          {questions.length === 0 && (
            <p className="text-sm text-text-faint">No practice questions yet — add one below.</p>
          )}
        </ul>
      )}

      <form onSubmit={handleAdd} className="space-y-4 rounded-card border border-dashed border-border p-5">
        <div className="grid grid-cols-2 gap-4">
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={inputCls}>
            <option value="mcq">Multiple choice</option>
            <option value="concept">Concept (open-ended)</option>
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className={inputCls}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <textarea required value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Question prompt" className={inputCls} rows={2} />
        {type === "mcq" && (
          <input
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="Options, comma separated (e.g. O(1), O(n), O(log n))"
            className={inputCls}
          />
        )}
        <input
          required
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder={type === "mcq" ? "Correct option (must match one above exactly)" : "Model answer"}
          className={inputCls}
        />
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explanation shown after answering (optional)"
          className={inputCls}
          rows={2}
        />
        <button type="submit" disabled={submitting} className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
          {submitting ? "Adding…" : "+ Add question"}
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded border border-border bg-ink px-3 py-2 text-sm text-text-primary outline-none focus:border-accent";
