import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { marked } from "marked";
import * as notesApi from "../api/notes";
import type { ApiNote } from "../api/notes";
import AdBannerSlot from "../components/ads/AdBannerSlot";
import ProtectedContent from "../components/ProtectedContent";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function NoteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [note, setNote] = useState<ApiNote | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setStatus("loading");
    notesApi
      .getNote(slug)
      .then(({ note }) => {
        if (!cancelled) {
          setNote(note);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useDocumentMeta({
    title: note ? note.title : "Notes",
    description: note?.description,
    path: `/notes/${slug ?? ""}`,
  });

  if (status === "loading") return <div className="container-page py-12 text-sm text-text-muted">Loading…</div>;
  if (status === "error" || !note)
    return (
      <div className="container-page py-12">
        <p className="text-sm text-error">Couldn't find that note.</p>
        <Link to="/notes" className="mt-2 inline-block text-sm text-accent hover:underline">
          ← Back to Notes Library
        </Link>
      </div>
    );

  const hasContent = note.content.trim().length > 0;
  const hasAttachment = Boolean(note.attachmentUrl);

  return (
    <div className="container-page max-w-3xl py-12">
      <p className="station-code mb-3">
        <Link to="/notes" className="hover:text-text-primary">Notes</Link> / {note.category}
      </p>
      <h1 className="font-display text-2xl font-semibold">{note.title}</h1>
      <p className="mt-2 text-sm text-text-muted">{note.description}</p>

      {/* First ad — right after the intro, before the actual content */}
      <AdBannerSlot variant="content" className="mt-8" />

      {hasContent && (
        <div className="mt-8">
          <ProtectedContent>
            <div
              className="prose prose-sm max-w-none p-5"
              // Content is authored only by trusted admins via the admin panel — same trust
              // level as any other admin-entered content already rendered elsewhere in the app.
              dangerouslySetInnerHTML={{ __html: marked.parse(note.content) as string }}
            />
          </ProtectedContent>
        </div>
      )}

      {/* Second ad — between the written notes and the attachment, if both exist */}
      {hasContent && hasAttachment && <AdBannerSlot variant="content" className="mt-8" />}

      {hasAttachment && (
        <div className="mt-8">
          <p className="station-code mb-3">Attachment</p>
          <ProtectedContent>
            {note.attachmentType === "image" ? (
              <img src={note.attachmentUrl} alt={note.title} className="w-full" draggable={false} />
            ) : (
              <embed src={note.attachmentUrl} type="application/pdf" className="h-[80vh] w-full" />
            )}
          </ProtectedContent>
        </div>
      )}

      <AdBannerSlot variant="content" className="mt-10" />
    </div>
  );
}
