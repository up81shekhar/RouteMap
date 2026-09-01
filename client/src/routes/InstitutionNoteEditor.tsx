import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import * as institutionsApi from "../api/institutions";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function InstitutionNoteEditor() {
  const { slug } = useParams<{ slug: string }>();
  const isNew = !slug || slug === "new";
  useDocumentMeta({ title: isNew ? "New class note" : "Edit class note", noindex: true, path: "/institution/notes" });

  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentType, setAttachmentType] = useState<"pdf" | "image" | "">("");
  const [order, setOrder] = useState(0);
  const [loaded, setLoaded] = useState(isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !accessToken || !slug) return;
    institutionsApi.listMyNotes(accessToken).then(({ notes }) => {
      const note = notes.find((n) => n.slug === slug);
      if (note) {
        setTitle(note.title);
        setDescription(note.description);
        setCategory(note.category);
        setContent(note.content);
        setAttachmentUrl(note.attachmentUrl);
        setAttachmentType(note.attachmentType);
        setOrder(note.order);
      }
      setLoaded(true);
    });
  }, [isNew, slug, accessToken]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    setError(null);
    const input = { title, description, category, content, attachmentUrl, attachmentType, order };
    try {
      if (isNew) {
        await institutionsApi.createMyNote(input, accessToken);
      } else if (slug) {
        await institutionsApi.updateMyNote(slug, input, accessToken);
      }
      navigate("/institution/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the note.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) return <p className="container-page py-12 text-sm text-text-muted">Loading…</p>;

  return (
    <div className="container-page max-w-2xl py-12">
      <p className="station-code mb-3">
        <Link to="/institution/notes" className="hover:text-text-primary">Private notes</Link> / {isNew ? "New" : slug}
      </p>
      <h1 className="mb-6 font-display text-2xl font-semibold">{isNew ? "New private note" : "Edit private note"}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Short description">
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} />
        </Field>
        <Field label="Category">
          <input required value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Notes content (Markdown, optional)">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className={`${inputCls} font-mono text-xs`}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Attachment URL (optional)">
            <input value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Attachment type">
            <select
              value={attachmentType}
              onChange={(e) => setAttachmentType(e.target.value as typeof attachmentType)}
              className={inputCls}
            >
              <option value="">None</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
            </select>
          </Field>
        </div>
        <Field label="Order">
          <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className={inputCls} />
        </Field>

        {error && <p className="text-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : isNew ? "Create note" : "Save changes"}
        </button>
        <p className="text-xs text-text-faint">
          Only visible to your own students — publish it from the private notes list once ready.
        </p>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded border border-border bg-surface px-3 py-2 text-sm";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-text-muted">{label}</label>
      {children}
    </div>
  );
}
