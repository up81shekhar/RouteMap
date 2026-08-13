import { apiFetch } from "./client";

export type ApiProgress = {
  roadmapSlug: string;
  nodeSlug: string;
  completedLessonIndices: number[];
};

export function getProgress(accessToken: string, roadmapSlug?: string, nodeSlug?: string) {
  const params = new URLSearchParams();
  if (roadmapSlug) params.set("roadmapSlug", roadmapSlug);
  if (nodeSlug) params.set("nodeSlug", nodeSlug);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<{ progress: ApiProgress[] }>(`/progress${qs}`, { accessToken });
}

export function markLessonComplete(roadmapSlug: string, nodeSlug: string, lessonIndex: number, accessToken: string) {
  return apiFetch<{ progress: ApiProgress }>("/progress", {
    method: "POST",
    body: { roadmapSlug, nodeSlug, lessonIndex },
    accessToken,
  });
}
