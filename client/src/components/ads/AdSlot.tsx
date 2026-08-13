type Placement = "homepage_banner" | "roadmap_sidebar" | "native_block" | "search_sidebar";

const sizing: Record<Placement, string> = {
  homepage_banner: "h-24 sm:h-28",
  roadmap_sidebar: "h-52",
  native_block: "h-20",
  search_sidebar: "h-40",
};

/**
 * Placeholder ad unit. Wire the real provider's script/tag in here later
 * (e.g. AdSense <ins> tag) behind the same wrapper so placement rules
 * (never inside the player, always labeled, never covering content)
 * stay enforced in one place.
 */
export default function AdSlot({ placement, className = "" }: { placement: Placement; className?: string }) {
  return (
    <div
      className={`flex ${sizing[placement]} w-full items-center justify-center rounded-card border border-dashed border-border bg-surface/50 ${className}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
        Advertisement
      </span>
    </div>
  );
}
