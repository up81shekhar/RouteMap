import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function NotFound() {
  useDocumentMeta({ title: "Page Not Found", noindex: true, path: typeof window !== "undefined" ? window.location.pathname : "/404" });

  return (
    <div className="container-page py-24 text-center">
      <p className="station-code mb-3">404</p>
      <h1 className="font-display text-2xl font-semibold">This page doesn't exist.</h1>
      <p className="mt-3 text-sm text-text-muted">
        The link might be broken, or the page may have moved.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Back to home
        </Link>
        <Link
          to="/roadmaps"
          className="rounded border border-border px-4 py-2 text-sm text-text-muted hover:text-text-primary"
        >
          Browse all roadmaps
        </Link>
      </div>
    </div>
  );
}
