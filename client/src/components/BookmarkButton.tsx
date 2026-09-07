import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import * as bookmarksApi from "../api/bookmarks";

export default function BookmarkButton({
  bookmarkKey,
  type,
  title,
  path,
  className = "",
}: {
  bookmarkKey: string;
  type: "roadmap" | "topic" | "note";
  title: string;
  path: string;
  className?: string;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    bookmarksApi
      .listBookmarks(accessToken)
      .then(({ bookmarks }) => {
        if (!cancelled) setSaved(bookmarks.some((b) => b.key === bookmarkKey));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [accessToken, bookmarkKey]);

  if (!user) return null; // bookmarking needs an account — nothing to show for guests

  async function toggle() {
    if (!accessToken || busy) return;
    setBusy(true);
    try {
      if (saved) {
        await bookmarksApi.removeBookmark(bookmarkKey, accessToken);
        setSaved(false);
      } else {
        await bookmarksApi.addBookmark({ key: bookmarkKey, type, title, path }, accessToken);
        setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove bookmark" : "Save for later"}
      title={saved ? "Saved" : "Save for later"}
      className={`flex h-8 w-8 items-center justify-center rounded border transition ${
        saved ? "border-accent bg-accent/10 text-accent" : "border-border text-text-muted hover:border-border-strong hover:text-text-primary"
      } ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
