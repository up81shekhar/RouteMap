import { NodeState } from "../../data/sampleRoadmaps";

const dotColor = (state: NodeState) => {
  switch (state) {
    case "done":
    case "current":
      return "#FF6B4A";
    default:
      return "#CACAC2";
  }
};

export default function SubStepLine({ steps }: { steps: { title: string; state: NodeState }[] }) {
  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-3">
      {steps.map((s, i) => (
        <li key={s.title} className="flex items-center gap-2">
          <span
            className="flex h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: s.state === "locked" || s.state === "unlocked" ? "transparent" : dotColor(s.state), border: `2px solid ${dotColor(s.state)}` }}
          />
          <span className={`text-sm ${s.state === "locked" ? "text-text-faint" : "text-text-primary"}`}>
            {i + 1}. {s.title}
          </span>
        </li>
      ))}
    </ol>
  );
}
