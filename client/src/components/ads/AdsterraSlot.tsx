import { useEffect, useRef } from "react";

const CONTAINER_ID = "container-a308ec8647025cb6f319ca5ac80bda04";
const SCRIPT_SRC =
  "https://pl30982491.profitableratecpmnetwork.com/a308ec8647025cb6f319ca5ac80bda04/invoke.js";

/**
 * Temporary Adsterra ad unit — stopgap while the AdSense account is
 * pending/under review. Swap back to <AdSlot /> once AdSense is approved;
 * don't render this alongside AdSense in the same slot.
 *
 * NOTE: this wraps a single Adsterra ad zone. Only mount ONE instance per
 * page — the script targets a container by a fixed id, so two instances on
 * the same page will collide. If a page needs more than one ad slot, keep
 * the others empty (or on AdSense) until a second Adsterra zone is created.
 */
export default function AdsterraSlot({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.dataset.loaded) return;
    container.dataset.loaded = "true";

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = SCRIPT_SRC;
    container.appendChild(script);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-text-faint">
        Advertisement
      </span>
      <div id={CONTAINER_ID} ref={containerRef} />
    </div>
  );
}
