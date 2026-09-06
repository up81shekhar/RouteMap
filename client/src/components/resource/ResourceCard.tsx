import { ResourceData } from "../../data/sampleRoadmaps";

const tagLabel: Record<ResourceData["tag"], string> = {
  recommended: "Recommended",
  alternative: "Alternative",
  quick: "Quick revision",
  deep_dive: "Deep dive",
  hindi: "Hindi",
};

const typeIcon: Record<ResourceData["type"], string> = {
  video: "▶",
  article: "≡",
  practice: "◆",
};

export default function ResourceCard({
  resource,
  active = false,
  onClick,
  onReport,
}: {
  resource: ResourceData;
  active?: boolean;
  onClick?: () => void;
  onReport?: () => void;
}) {
  const isClickable = resource.type === "video" && !!resource.videoId && !!onClick;

  return (
    <div
      className={`relative w-full rounded-card border transition-colors ${
        active ? "border-accent bg-accent/10" : "border-border bg-surface"
      }`}
    >
      <button
        type="button"
        onClick={isClickable ? onClick : undefined}
        disabled={!isClickable}
        className={`flex w-full items-start gap-3 p-4 text-left ${
          isClickable ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm ${active ? "bg-accent text-white" : "bg-ink text-text-muted"}`}>
          {typeIcon[resource.type]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide text-accent">
              {tagLabel[resource.tag]}
            </span>
            {active && (
              <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">· Now playing</span>
            )}
          </div>
          <h4 className="mt-1 truncate pr-14 font-display text-sm font-semibold text-text-primary">
            {resource.title}
          </h4>
          <p className="mt-1 text-xs text-text-muted">
            {resource.source} · {resource.language}
            {resource.durationMinutes ? ` · ${resource.durationMinutes} min` : ""}
          </p>
          {!isClickable && resource.type !== "video" && (
            <p className="mt-1.5 text-[11px] text-text-faint">External link — added during admin curation</p>
          )}
        </div>
      </button>

      {onReport && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReport();
          }}
          className="absolute right-3 top-3 font-mono text-[10px] uppercase tracking-wide text-text-faint hover:text-error"
        >
          Report
        </button>
      )}
    </div>
  );
}
