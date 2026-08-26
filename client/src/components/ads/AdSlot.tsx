import { useEffect, useRef } from "react";

type Placement = "homepage_banner" | "roadmap_sidebar" | "native_block" | "search_sidebar";

const sizing: Record<Placement, string> = {
  homepage_banner: "min-h-24 sm:min-h-28",
  roadmap_sidebar: "min-h-52",
  native_block: "min-h-20",
  search_sidebar: "min-h-40",
};

const ADSENSE_CLIENT = "ca-pub-1876038455348983";
// Single responsive slot reused across placements for now.
const ADSENSE_SLOT = "3439085465";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Live AdSense ad unit, wrapped so placement rules (never inside the
 * player, always labeled, never covering content) stay enforced in one
 * place. Each mount pushes a fresh request to adsbygoogle.
 */
export default function AdSlot({ placement, className = "" }: { placement: Placement; className?: string }) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not loaded yet (e.g. blocked) - fail silently.
    }
  }, []);

  return (
    <div className={`w-full ${sizing[placement]} ${className}`}>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-text-faint">
        Advertisement
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
