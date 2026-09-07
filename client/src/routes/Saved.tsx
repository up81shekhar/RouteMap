import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import * as bookmarksApi from "../api/bookmarks";
import type { ApiBookmark } from "../api/bookmarks";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const typeLabel: Record<ApiBookmark["type"], string> = {
  roadmap: "Roadmap",
  topic: "Topic",
  note: "Note",
};

export default function Saved() {
  useDocumentMeta({ title: "Saved", noindex: true, path: "/saved" });

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [bookmarks, setBookmarks] = useState<ApiBookmark[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function refresh() {
    if (!accessToken) return;
    bookmarksApi
      .listBookmarks(accessToken)
      .then(({ bookmarks }) => {
        setBookmarks(bookmarks);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(refresh, [accessToken]);

  if (!user) return <Navigate to="/login" replace />;

  async function handleRemove(key: string) {
    if (!accessToken) return;
    await bookmarksApi.removeBookmark(key, accessToken);
    refresh();
  }

  return (
    <div className="container-page py-12">
      <p className="station-code mb-3">Your library</p>
      <h1 className="font-display text-2xl font-semibold">Saved</h1>
      <p className="mt-1 text-sm text-text-muted">Roadmaps, topics, and notes you've bookmarked for later.</p>

      {status === "loading" && <p className="mt-8 text-sm text-text-muted">Loading…</p>}
      {status === "error" && <p className="mt-8 text-sm text-error">Couldn't load your saved items.</p>}

      {status === "ready" && (
        <div className="mt-8 space-y-2">
          {bookmarks.length === 0 && (
            <p className="rounded-card border border-border bg-surface p-6 text-sm text-text-faint">
              Nothing saved yet — tap the bookmark icon on any roadmap, topic, or note.
            </p>
          )}
          {bookmarks.map((b) => (
            <div
              key={b.key}
              className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3"
            >
              <Link to={b.path} className="min-w-0 flex-1 hover:opacity-80">
                <span className="font-mono text-[10px] uppercase tracking-wide text-accent">{typeLabel[b.type]}</span>
                <p className="truncate text-sm font-medium text-text-primary">{b.title}</p>
              </Link>
              <button
                onClick={() => handleRemove(b.key)}
                className="ml-3 shrink-0 rounded border border-border px-2.5 py-1 text-xs text-text-muted hover:border-error hover:text-error"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
