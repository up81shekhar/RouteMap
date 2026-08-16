import { apiFetch } from "./client";

export type ApiPracticeQuestion = {
  _id: string;
  type: "mcq" | "coding" | "concept" | "interview";
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export function getPractice(roadmapSlug: string, nodeSlug: string) {
  return apiFetch<{ questions: ApiPracticeQuestion[] }>(`/practice/${roadmapSlug}/${nodeSlug}`);
}
