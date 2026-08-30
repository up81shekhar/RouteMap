import { apiFetch } from "./client";
import { LineColor, RoadmapCategory, ResourceTag, ResourceType } from "../data/sampleRoadmaps";
import { ApiRoadmap, ApiRoadmapNode, ApiResource } from "./roadmaps";
import type { ApiNote } from "./notes";
import type { InstitutionDashboard } from "./institutions";

export type AdminInstitutionSummary = { name: string; slug: string; joinCode: string; studentCount: number };

export function adminListInstitutions(accessToken: string) {
  return apiFetch<{ institutions: AdminInstitutionSummary[] }>("/admin/institutions", { accessToken });
}

export function adminGetInstitutionDashboard(slug: string, accessToken: string) {
  return apiFetch<InstitutionDashboard>(`/admin/institutions/${slug}`, { accessToken });
}

export type NoteInput = {
  title: string;
  description: string;
  category: string;
  content: string;
  attachmentUrl: string;
  attachmentType: "pdf" | "image" | "";
  order: number;
};

export function adminListNotes(accessToken: string) {
  return apiFetch<{ notes: ApiNote[] }>("/admin/notes", { accessToken });
}

export function adminGetNote(slug: string, accessToken: string) {
  return apiFetch<{ note: ApiNote }>(`/admin/notes/${slug}`, { accessToken });
}

export function createNote(input: NoteInput, accessToken: string) {
  return apiFetch<{ note: ApiNote }>("/admin/notes", { method: "POST", body: input, accessToken });
}

export function updateNote(slug: string, patch: Partial<NoteInput>, accessToken: string) {
  return apiFetch<{ note: ApiNote }>(`/admin/notes/${slug}`, { method: "PUT", body: patch, accessToken });
}

export function toggleNotePublish(slug: string, accessToken: string) {
  return apiFetch<{ note: ApiNote }>(`/admin/notes/${slug}/publish`, { method: "PATCH", accessToken });
}

export function deleteNote(slug: string, accessToken: string) {
  return apiFetch<void>(`/admin/notes/${slug}`, { method: "DELETE", accessToken });
}

export type NewRoadmapInput = {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: RoadmapCategory;
  color: LineColor;
  estimatedDurationHours: number;
  prerequisites: string[];
  careerOutcomes: string[];
};

export function createRoadmap(input: NewRoadmapInput, accessToken: string) {
  return apiFetch<{ roadmap: ApiRoadmap }>("/admin/roadmaps", { method: "POST", body: input, accessToken });
}

export function updateRoadmap(slug: string, patch: Partial<NewRoadmapInput>, accessToken: string) {
  return apiFetch<{ roadmap: ApiRoadmap }>(`/admin/roadmaps/${slug}`, { method: "PUT", body: patch, accessToken });
}

export function togglePublish(slug: string, accessToken: string) {
  return apiFetch<{ roadmap: ApiRoadmap }>(`/admin/roadmaps/${slug}/publish`, { method: "PATCH", accessToken });
}

export function deleteRoadmap(slug: string, accessToken: string) {
  return apiFetch<void>(`/admin/roadmaps/${slug}`, { method: "DELETE", accessToken });
}

export function addNode(roadmapSlug: string, title: string, estimatedHours: number, accessToken: string) {
  return apiFetch<{ node: ApiRoadmapNode }>(`/admin/roadmaps/${roadmapSlug}/nodes`, {
    method: "POST",
    body: { title, estimatedHours },
    accessToken,
  });
}

export function updateNode(
  roadmapSlug: string,
  nodeSlug: string,
  patch: { title?: string; estimatedHours?: number },
  accessToken: string
) {
  return apiFetch<{ node: ApiRoadmapNode }>(`/admin/roadmaps/${roadmapSlug}/nodes/${nodeSlug}`, {
    method: "PUT",
    body: patch,
    accessToken,
  });
}

export function deleteNode(roadmapSlug: string, nodeSlug: string, accessToken: string) {
  return apiFetch<void>(`/admin/roadmaps/${roadmapSlug}/nodes/${nodeSlug}`, { method: "DELETE", accessToken });
}

export function moveNode(roadmapSlug: string, nodeSlug: string, direction: "up" | "down", accessToken: string) {
  return apiFetch<{ ok: true }>(`/admin/roadmaps/${roadmapSlug}/nodes/${nodeSlug}/move`, {
    method: "PATCH",
    body: { direction },
    accessToken,
  });
}

export type NewResourceInput = {
  roadmapSlug: string;
  nodeSlug: string;
  type: ResourceType;
  tag: ResourceTag;
  title: string;
  source: string;
  language: "English" | "Hindi" | "Hinglish";
  videoId?: string;
  url?: string;
  durationMinutes?: number;
  lessonIndex?: number;
};

export function addResource(input: NewResourceInput, accessToken: string) {
  return apiFetch<{ resource: ApiResource }>("/admin/resources", { method: "POST", body: input, accessToken });
}

export function deleteResource(id: string, accessToken: string) {
  return apiFetch<void>(`/admin/resources/${id}`, { method: "DELETE", accessToken });
}

export type ImportPlaylistInput = {
  playlistUrl: string;
  category: RoadmapCategory;
  color: LineColor;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  title?: string;
  description?: string;
};

export function importPlaylist(input: ImportPlaylistInput, accessToken: string) {
  return apiFetch<{ roadmap: ApiRoadmap; videosImported: number }>("/admin/import/playlist", {
    method: "POST",
    body: input,
    accessToken,
  });
}

export type NewPracticeQuestionInput = {
  roadmapSlug: string;
  nodeSlug: string;
  type: "mcq" | "coding" | "concept" | "interview";
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export function addPracticeQuestion(input: NewPracticeQuestionInput, accessToken: string) {
  return apiFetch<{ question: unknown }>("/admin/practice", { method: "POST", body: input, accessToken });
}

export function deletePracticeQuestion(id: string, accessToken: string) {
  return apiFetch<void>(`/admin/practice/${id}`, { method: "DELETE", accessToken });
}
