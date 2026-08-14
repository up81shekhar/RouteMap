import { apiFetch } from "./client";
import { ApiRoadmap, ApiRoadmapNode } from "./roadmaps";

export function search(q: string) {
  return apiFetch<{ roadmaps: ApiRoadmap[]; topics: (ApiRoadmapNode & { roadmapSlug: string })[] }>(
    `/search?q=${encodeURIComponent(q)}`
  );
}
