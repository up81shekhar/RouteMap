import { Link } from "react-router-dom";
import { LineColor, RoadmapCategory } from "../../data/sampleRoadmaps";

export type RoadmapCardData = {
  slug: string;
  lineCode: string; // e.g. "L1"
  title: string;
  stops: number; // number of topics
  hours: number;
  color: LineColor;
  category: RoadmapCategory;
};

const colorMap = {
  coral: { dot: "bg-line-coral", text: "text-line-coral", border: "hover:border-line-coral/60" },
  teal: { dot: "bg-line-teal", text: "text-line-teal", border: "hover:border-line-teal/60" },
  violet: { dot: "bg-line-violet", text: "text-line-violet", border: "hover:border-line-violet/60" },
  amber: { dot: "bg-line-amber", text: "text-line-amber", border: "hover:border-line-amber/60" },
};

export default function RoadmapCard({ data }: { data: RoadmapCardData }) {
  const c = colorMap[data.color];
  return (
    <Link
      to={`/roadmaps/${data.slug}`}
      className={`group flex flex-col justify-between rounded-card border border-border bg-surface p-5 transition-colors ${c.border}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
        <span className={`font-mono text-xs tracking-wide ${c.text}`}>{data.lineCode}</span>
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold text-text-primary group-hover:text-text-primary">
        {data.title}
      </h3>

      <div className="mt-6 flex items-center justify-between text-xs text-text-muted">
        <span>{data.stops} stops</span>
        <span>~{data.hours} hrs</span>
      </div>
    </Link>
  );
}
