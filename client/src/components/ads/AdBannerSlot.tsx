import { useEffect, useRef, useState } from "react";

export type AdSize = { key: string; width: number; height: number };

// Fixed, standard IAB banner sizes only — no popunders, no social bars, no
// autoplay. Each renders as one small, clearly-labeled box that never moves
// or overlaps content.
export const AD_SIZES = {
  leaderboard: { key: "18257c85f0344e82134d800953a039e2", width: 728, height: 90 },
  banner: { key: "9f2f56741a07a87ff888940354029b02", width: 468, height: 60 },
  rectangle: { key: "72cd1d5d4ab8ec628f742d7af871ba75", width: 300, height: 250 },
  skyscraper: { key: "0082b86cb3ad5a02bc679a886a6a5a8d", width: 160, height: 600 },
  halfSkyscraper: { key: "e1bac9247c48fd6e76f64f3774cd87f6", width: 160, height: 300 },
  mobileBanner: { key: "7a13a98b0d2284974f99dea82a25cdbf", width: 320, height: 50 },
} as const satisfies Record<string, AdSize>;

type Variant = "content" | "sidebar" | "rectangle" | "compactSidebar";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

/** Renders one ad unit inside an isolated iframe (safe for document.write-based networks in a SPA). */
export function BannerFrame({ size }: { size: AdSize }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const iframe = document.createElement("iframe");
    iframe.style.width = `${size.width}px`;
    iframe.style.height = `${size.height}px`;
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.setAttribute("scrolling", "no");
    iframe.title = "Advertisement";
    container.appendChild(iframe);

    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(
        `<!doctype html><html><head><style>html,body{margin:0;padding:0;overflow:hidden;}</style></head><body>` +
          `<script>atOptions={key:"${size.key}",format:"iframe",height:${size.height},width:${size.width},params:{}};</script>` +
          `<script src="https://www.highrevenueformat.com/${size.key}/invoke.js"></script>` +
          `</body></html>`
      );
      doc.close();
    }

    return () => {
      if (container.contains(iframe)) container.removeChild(iframe);
    };
  }, [size]);

  return <div ref={containerRef} style={{ width: size.width, height: size.height, maxWidth: "100%" }} />;
}

function sizeForVariant(variant: Variant, isMobile: boolean): AdSize {
  switch (variant) {
    case "sidebar":
      return AD_SIZES.skyscraper;
    case "compactSidebar":
      return AD_SIZES.halfSkyscraper;
    case "rectangle":
      return AD_SIZES.rectangle;
    case "content":
    default:
      return isMobile ? AD_SIZES.mobileBanner : AD_SIZES.leaderboard;
  }
}

/**
 * A single, contained ad banner — never more than one box, always a
 * standard fixed size, always labeled.
 * - "content": wide banner sized to the viewport (leaderboard on desktop, a slim mobile banner on phones)
 * - "sidebar": tall narrow unit (160x600) that fits a ~280px column
 * - "compactSidebar": shorter narrow unit (160x300) for a sidebar that already has other content below it
 * - "rectangle": classic 300x250 box, for a wider content slot
 */
export default function AdBannerSlot({ variant, className = "" }: { variant: Variant; className?: string }) {
  const isMobile = useIsMobile();
  const size = sizeForVariant(variant, isMobile);

  return (
    <div className={`flex w-full flex-col items-center ${className}`}>
      <span className="mb-1 block w-full max-w-full font-mono text-[10px] uppercase tracking-wide text-text-faint">
        Advertisement
      </span>
      <div className="overflow-hidden rounded border border-border bg-surface">
        <BannerFrame key={variant + (isMobile ? "-m" : "-d")} size={size} />
      </div>
    </div>
  );
}
