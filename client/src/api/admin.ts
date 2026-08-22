import { apiFetch } from "./client";
import { LineColor, RoadmapCategory, ResourceTag, ResourceType } from "../data/sampleRoadmaps";
import { ApiRoadmap, ApiRoadmapNode, ApiResource } from "./roadmaps";

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
