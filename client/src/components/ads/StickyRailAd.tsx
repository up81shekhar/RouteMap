import { useState } from "react";
import { AD_SIZES, BannerFrame } from "./AdBannerSlot";

/**
 * A skyscraper ad pinned to the right edge of the viewport. Only shown on
 * very wide screens (2xl+, ~1536px) where the page content is nowhere near
 * that edge, so it never overlaps or crowds anything. Dismissible so it
 * never feels forced on anyone who doesn't want it.
 */
export default function StickyRailAd() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden w-[190px] items-center justify-center 2xl:flex">
      <div className="pointer-events-auto relative rounded border border-border bg-surface p-2 shadow-lg">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss ad"
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-[10px] text-text-muted hover:text-text-primary"
        >
          ×
        </button>
        <span className="mb-1 block text-center font-mono text-[10px] uppercase tracking-wide text-text-faint">
          Advertisement
        </span>
        <BannerFrame size={AD_SIZES.skyscraper} />
      </div>
    </div>
  );
}
