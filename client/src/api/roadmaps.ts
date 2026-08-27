import { apiFetch } from "./client";
import { LineColor, RoadmapCategory, NodeState } from "../data/sampleRoadmaps";

export type ApiRoadmapNode = {
  _id: string;
  slug: string;
  title: string;
  estimatedHours: number;
  order: number;
  isPublished: boolean;
  /** "playlist" = auto-imported from YouTube (single real-titled video per station, no fixed lesson steps). */
  contentSource?: "manual" | "playlist";
};

export type ApiRoadmap = {
  _id: string;
  slug: string;
  lineCode: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  color: LineColor;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDurationHours: number;
  prerequisites: string[];
  careerOutcomes: string[];
  isPublished: boolean;
  nodeCount?: number;
};

export type ApiResource = {
  _id: string;
  type: "video" | "article" | "practice";
  tag: "recommended" | "alternative" | "quick" | "deep_dive" | "hindi";
  title: string;
  source: string;
  language: "English" | "Hindi" | "Hinglish";
  videoId?: string;
  url?: string;
  durationMinutes?: number;
  lessonIndex?: number;
};

export function listRoadmaps(accessToken?: string | null) {
  return apiFetch<{ roadmaps: ApiRoadmap[] }>("/roadmaps", { accessToken });
}

export function getRoadmap(slug: string, accessToken?: string | null) {
  return apiFetch<{ roadmap: ApiRoadmap; nodes: ApiRoadmapNode[] }>(`/roadmaps/${slug}`, { accessToken });
}

export function getTopic(roadmapSlug: string, nodeSlug: string) {
  return apiFetch<{ node: ApiRoadmapNode; resources: ApiResource[] }>(`/topics/${roadmapSlug}/${nodeSlug}`);
}

// Helper: derive the client's NodeState (done/current/unlocked/locked) from
// order + how many prior nodes are done, since the API only stores order —
// completion state is a client-side concept driven by the progress store.
export function deriveNodeState(index: number, completedCount: number): NodeState {
  if (index < completedCount) return "done";
  if (index === completedCount) return "current";
  if (index === completedCount + 1) return "unlocked";
  return "locked";
}
