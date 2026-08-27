import { useEffect, useRef, useState } from "react";

type Size = { key: string; width: number; height: number };

// Fixed, standard IAB banner sizes only — no popunders, no social bars, no
// autoplay. Each renders as one small, clearly-labeled box that never moves
// or overlaps content.
const SIZES = {
  leaderboard: { key: "18257c85f0344e82134d800953a039e2", width: 728, height: 90 },
  banner: { key: "9f2f56741a07a87ff888940354029b02", width: 468, height: 60 },
  rectangle: { key: "72cd1d5d4ab8ec628f742d7af871ba75", width: 300, height: 250 },
  skyscraper: { key: "0082b86cb3ad5a02bc679a886a6a5a8d", width: 160, height: 600 },
  halfSkyscraper: { key: "e1bac9247c48fd6e76f64f3774cd87f6", width: 160, height: 300 },
  mobileBanner: { key: "7a13a98b0d2284974f99dea82a25cdbf", width: 320, height: 50 },
} as const satisfies Record<string, Size>;

type Variant = "content" | "sidebar";

function useIsMobile() {
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

function BannerFrame({ size }: { size: Size }) {
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

    // Ad network relies on document.write, which is unsafe to call on the
    // parent document after load (can wipe the page in some browsers). An
    // isolated iframe document is always safe to write to.
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

/**
 * A single, contained ad banner — never more than one box, always a
 * standard fixed size, always labeled. `variant="content"` picks a wide
 * banner sized to the viewport (leaderboard on desktop, a slim mobile
 * banner on phones); `variant="sidebar"` picks a tall narrow unit that
 * fits a ~280px column.
 */
export default function AdBannerSlot({ variant, className = "" }: { variant: Variant; className?: string }) {
  const isMobile = useIsMobile();
  const size: Size = variant === "sidebar" ? SIZES.skyscraper : isMobile ? SIZES.mobileBanner : SIZES.leaderboard;

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
