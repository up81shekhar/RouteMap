// Lightweight GA4 wrapper. Loads nothing and every call is a harmless no-op
// until VITE_GA_MEASUREMENT_ID is set — so this is safe to leave wired up
// in every environment (dev, preview, prod-without-a-GA-property yet).
//
// Setup: create a GA4 property at analytics.google.com, copy its
// Measurement ID (starts with "G-"), and set VITE_GA_MEASUREMENT_ID in
// Vercel's environment variables, then redeploy (Vite bakes it in at
// build time, same as VITE_API_BASE_URL).

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
let initialized = false;

export function initAnalytics() {
  if (!MEASUREMENT_ID || initialized || typeof document === "undefined") return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  // send_page_view: false — we send pageviews manually on route change,
  // since GA4's default assumes a full page reload per navigation, which
  // an SPA doesn't do.
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
}

export function trackPageview(path: string, title?: string) {
  if (!MEASUREMENT_ID || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

/**
 * Custom events, matching the event names in docs/PRD.md's analytics
 * section: roadmap_view, roadmap_started, topic_opened, video_started,
 * lesson_completed, practice_started, practice_completed, search,
 * bookmark, signup.
 */
export function trackEvent(name: string, params: Record<string, string | number | boolean | undefined> = {}) {
  if (!MEASUREMENT_ID || !window.gtag) return;
  window.gtag("event", name, params);
}
