import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import * as adminApi from "../../api/admin";
import type { ApiNote } from "../../api/notes";

export default function AdminNotesList() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function refresh() {
    if (!accessToken) return;
    setStatus("loading");
    adminApi
      .adminListNotes(accessToken)
      .then(({ notes }) => {
        setNotes(notes);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(refresh, [accessToken]);

  async function handlePublishToggle(slug: string) {
    if (!accessToken) return;
    await adminApi.toggleNotePublish(slug, accessToken);
    refresh();
  }

  async function handleDelete(slug: string) {
    if (!accessToken) return;
    if (!confirm("Delete this note? This can't be undone.")) return;
    await adminApi.deleteNote(slug, accessToken);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="station-code mb-2">Content</p>
          <h1 className="font-display text-2xl font-semibold">Notes</h1>
        </div>
        <Link
          to="/admin/notes/new"
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          + New note
        </Link>
      </div>

      {status === "loading" && <p className="mt-6 text-sm text-text-muted">Loading…</p>}
      {status === "error" && <p className="mt-6 text-sm text-error">Couldn't load notes.</p>}

      {status === "ready" && (
        <div className="mt-6 space-y-2">
          {notes.length === 0 && (
            <p className="rounded-card border border-border bg-surface p-6 text-sm text-text-faint">
              No notes yet — create your first one.
            </p>
          )}
          {notes.map((note) => (
            <div
              key={note.slug}
              className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{note.title}</p>
                <p className="text-xs text-text-faint">{note.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    note.isPublished ? "bg-success/10 text-success" : "bg-border text-text-faint"
                  }`}
                >
                  {note.isPublished ? "Published" : "Draft"}
                </span>
                <button
                  onClick={() => handlePublishToggle(note.slug)}
                  className="rounded border border-border px-2.5 py-1 text-xs text-text-muted hover:border-border-strong hover:text-text-primary"
                >
                  {note.isPublished ? "Unpublish" : "Publish"}
                </button>
                <Link
                  to={`/admin/notes/${note.slug}`}
                  className="rounded border border-border px-2.5 py-1 text-xs text-text-muted hover:border-border-strong hover:text-text-primary"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(note.slug)}
                  className="rounded border border-border px-2.5 py-1 text-xs text-error hover:border-error"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
