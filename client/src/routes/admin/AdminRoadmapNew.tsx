import { FormEvent, ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/adminStore";
import { LineColor, RoadmapCategory } from "../../data/sampleRoadmaps";

export default function AdminRoadmapNew() {
  const addRoadmap = useAdminStore((s) => s.addRoadmap);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [category, setCategory] = useState<RoadmapCategory>("tech");
  const [color, setColor] = useState<LineColor>("coral");
  const [hours, setHours] = useState(20);
  const [prerequisites, setPrerequisites] = useState("");
  const [careerOutcomes, setCareerOutcomes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const slug = await addRoadmap({
        title,
        description,
        difficulty,
        category,
        color,
        estimatedDurationHours: hours,
        prerequisites: prerequisites.split(",").map((s) => s.trim()).filter(Boolean),
        careerOutcomes: careerOutcomes.split(",").map((s) => s.trim()).filter(Boolean),
      });
      navigate(`/admin/roadmaps/${slug}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <p className="station-code mb-3">
        <Link to="/admin" className="hover:text-text-primary">Roadmaps</Link> / New
      </p>
      <h1 className="mb-6 font-display text-2xl font-semibold">New roadmap</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. DevOps" />
        </Field>
        <Field label="Description">
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} rows={2} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Difficulty">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className={inputCls}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </Field>
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as RoadmapCategory)} className={inputCls}>
              <option value="tech">Tech</option>
              <option value="exam">Exam prep</option>
              <option value="school">School</option>
              <option value="skill">Skill</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Line color">
            <select value={color} onChange={(e) => setColor(e.target.value as LineColor)} className={inputCls}>
              <option value="coral">Coral</option>
              <option value="teal">Teal</option>
              <option value="violet">Violet</option>
              <option value="amber">Amber</option>
            </select>
          </Field>
          <Field label="Estimated hours">
            <input type="number" min={1} value={hours} onChange={(e) => setHours(Number(e.target.value))} className={inputCls} />
          </Field>
        </div>
        <Field label="Prerequisites (comma separated)">
          <input value={prerequisites} onChange={(e) => setPrerequisites(e.target.value)} className={inputCls} placeholder="e.g. Basic Linux, Git" />
        </Field>
        <Field label="Career outcomes (comma separated)">
          <input value={careerOutcomes} onChange={(e) => setCareerOutcomes(e.target.value)} className={inputCls} placeholder="e.g. DevOps Engineer roles" />
        </Field>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={submitting} className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">
            {submitting ? "Creating…" : "Create roadmap"}
          </button>
          <Link to="/admin" className="rounded border border-border px-4 py-2 text-sm text-text-muted hover:text-text-primary">
            Cancel
          </Link>
        </div>
        <p className="text-xs text-text-faint">New roadmaps start as a draft — publish it from the list once its stations are ready.</p>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-text-muted">{label}</label>
      {children}
    </div>
  );
}
