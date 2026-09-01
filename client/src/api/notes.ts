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

export function listNotes(accessToken?: string) {
  return apiFetch<{ notes: ApiNote[] }>("/notes", { accessToken });
}

export function getNote(slug: string, accessToken?: string) {
  return apiFetch<{ note: ApiNote }>(`/notes/${slug}`, { accessToken });
}
