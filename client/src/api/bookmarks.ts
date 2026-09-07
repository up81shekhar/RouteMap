import { apiFetch } from "./client";

export type ApiBookmark = {
  _id: string;
  key: string;
  type: "roadmap" | "topic" | "note";
  title: string;
  path: string;
  createdAt: string;
};

export function listBookmarks(accessToken: string) {
  return apiFetch<{ bookmarks: ApiBookmark[] }>("/bookmarks", { accessToken });
}

export function addBookmark(
  input: { key: string; type: "roadmap" | "topic" | "note"; title: string; path: string },
  accessToken: string
) {
  return apiFetch<{ bookmark: ApiBookmark }>("/bookmarks", { method: "POST", body: input, accessToken });
}

export function removeBookmark(key: string, accessToken: string) {
  return apiFetch<{ ok: true }>(`/bookmarks/${encodeURIComponent(key)}`, { method: "DELETE", accessToken });
}
