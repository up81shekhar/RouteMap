import { ReactNode, useEffect, useState } from "react";

/**
 * Wraps note content with copy/print deterrents and a RouteMap watermark.
 * This does NOT and CANNOT block OS-level screenshots (Snipping Tool,
 * Cmd+Shift+4, phone screenshot buttons) — no website can. What this does
 * do: discourage casual copy/paste and printing, and mark the content as
 * belonging to RouteMap if it's ever screenshotted and shared.
 */
export default function ProtectedContent({ children }: { children: ReactNode }) {
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    const onBlur = () => setBlurred(true);
    const onFocus = () => setBlurred(false);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const watermarkText = "RouteMap · routemap-free.vercel.app";

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      className="relative select-none overflow-hidden rounded-card border border-border"
      style={{ filter: blurred ? "blur(12px)" : "none", transition: "filter 0.15s" }}
    >
      {/* Repeating diagonal watermark — identifies the viewer if this ever gets shared */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'>
              <text x='0' y='100' transform='rotate(-25 200 100)' font-size='16' fill='black' text-anchor='middle'>${watermarkText}</text>
            </svg>`
          )}")`,
          backgroundRepeat: "repeat",
        }}
      />
      <div className="print:hidden">{children}</div>
      <div className="hidden text-center text-sm text-text-faint print:block">
        Printing is disabled for this content.
      </div>
    </div>
  );
}
