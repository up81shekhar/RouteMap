import { Link } from "react-router-dom";
import { NodeState, RoadmapNodeData } from "../../data/sampleRoadmaps";

const colorHex: Record<string, string> = {
  coral: "#FF6B4A",
  teal: "#38BDF8",
  violet: "#6366F1",
  amber: "#E0A82E",
};

function nodeVisual(state: NodeState, hex: string) {
  switch (state) {
    case "done":
      return { fill: hex, stroke: hex, textClass: "text-text-primary" };
    case "current":
      return { fill: hex, stroke: hex, textClass: "text-text-primary" };
    case "unlocked":
      return { fill: "#F3F3F1", stroke: "#CACAC2", textClass: "text-text-primary" };
    case "locked":
    default:
      return { fill: "#F3F3F1", stroke: "#E1E1DC", textClass: "text-text-faint" };
  }
}

export default function SkillTree({
  roadmapSlug,
  nodes,
  color,
}: {
  roadmapSlug: string;
  nodes: RoadmapNodeData[];
  color: "coral" | "teal" | "violet" | "amber";
}) {
  const hex = colorHex[color];

  return (
    <ol className="relative">
      {nodes.map((node, i) => {
        const v = nodeVisual(node.state, hex);
        const isLast = i === nodes.length - 1;
        const isLocked = node.state === "locked";
        const isCurrent = node.state === "current";

        const content = (
          <div className="flex items-start gap-4 py-4">
            <div className="relative flex flex-col items-center">
              <span
                className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ background: v.fill, border: `2px solid ${v.stroke}` }}
              >
                {node.state === "done" && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {!isLast && (
                <span
                  className="w-0.5 flex-1"
                  style={{ background: node.state === "done" ? hex : "#E1E1DC", minHeight: "28px" }}
                />
              )}
            </div>

            <div className={`flex-1 rounded-card border px-4 py-3 ${isCurrent ? "border-white/20" : "border-border"} ${isLocked ? "opacity-60" : ""}`}
              style={isCurrent ? { borderColor: hex } : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`font-display text-sm font-semibold ${v.textClass}`}>
                  {String(i).padStart(2, "0")} · {node.title}
                </span>
                <span className="font-mono text-xs text-text-faint">{node.estimatedHours}h</span>
              </div>
              {isCurrent && (
                <span className="mt-1 inline-block font-mono text-[10px] uppercase tracking-wide" style={{ color: hex }}>
                  You are here
                </span>
              )}
            </div>
          </div>
        );

        return (
          <li key={node.slug}>
            {isLocked ? (
              <div className="cursor-not-allowed">{content}</div>
            ) : (
              <Link to={`/roadmaps/${roadmapSlug}/${node.slug}`} className="block hover:opacity-90">
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
