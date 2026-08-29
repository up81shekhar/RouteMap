import { apiFetch } from "./client";

export type ApiNote = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  content: string;
  attachmentUrl: string;
  attachmentType: "pdf" | "image" | "";
  order: number;
  isPublished: boolean;
};

export function listNotes() {
  return apiFetch<{ notes: ApiNote[] }>("/notes");
}

export function getNote(slug: string) {
  return apiFetch<{ note: ApiNote }>(`/notes/${slug}`);
}
