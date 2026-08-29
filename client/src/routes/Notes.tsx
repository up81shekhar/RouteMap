import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as notesApi from "../api/notes";
import type { ApiNote } from "../api/notes";
import AdBannerSlot from "../components/ads/AdBannerSlot";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Notes() {
  useDocumentMeta({
    title: "Free Notes Library",
    description:
      "Free study notes for exams, coding, and school subjects — typed notes and downloadable PDFs, all free on RouteMap.",
    path: "/notes",
  });

  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    notesApi
      .listNotes()
      .then(({ notes }) => {
        if (!cancelled) {
          setNotes(notes);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = Array.from(new Set(notes.map((n) => n.category)));

  return (
    <div className="container-page py-12">
      <p className="station-code mb-3">Free resources</p>
      <h1 className="font-display text-2xl font-semibold">Notes Library</h1>
      <p className="mt-2 max-w-2xl text-sm text-text-muted">
        Free study notes — typed summaries and downloadable PDFs for exams, coding, and school
        subjects. No signup needed to read.
      </p>

      {status === "loading" && <p className="mt-8 text-sm text-text-muted">Loading notes…</p>}
      {status === "error" && <p className="mt-8 text-sm text-error">Couldn't load notes right now.</p>}

      {status === "ready" && notes.length === 0 && (
        <p className="mt-8 rounded-card border border-border bg-surface p-6 text-sm text-text-faint">
          No notes published yet — check back soon.
        </p>
      )}

      {categories.map((category, i) => (
        <div key={category}>
          <div className="mt-10">
            <p className="station-code mb-3">{category}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notes
                .filter((n) => n.category === category)
                .map((note) => (
                  <Link
                    key={note.slug}
                    to={`/notes/${note.slug}`}
                    className="rounded-card border border-border bg-surface p-4 transition hover:border-border-strong"
                  >
                    <h3 className="font-display text-base font-semibold">{note.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-text-muted">{note.description}</p>
                    {note.attachmentType && (
                      <span className="mt-2 inline-block rounded-full border border-border px-2 py-0.5 text-xs text-text-faint">
                        {note.attachmentType === "pdf" ? "PDF" : "Image"} attached
                      </span>
                    )}
                  </Link>
                ))}
            </div>
          </div>

          {/* One ad between every couple of category sections — not stacked, not on every section */}
          {i > 0 && i % 2 === 1 && <AdBannerSlot variant="content" className="mt-10" />}
        </div>
      ))}
    </div>
  );
}
