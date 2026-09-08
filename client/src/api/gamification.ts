import { apiFetch } from "./client";

export type GamificationStats = {
  totalLessonsCompleted: number;
  streak: number;
  distinctRoadmaps: number;
  badges: string[];
};

export function getMyStats(accessToken: string) {
  return apiFetch<GamificationStats>("/gamification/me", { accessToken });
}

export const BADGE_INFO: Record<string, { label: string; emoji: string; description: string }> = {
  first_lesson: { label: "First Lesson", emoji: "🎉", description: "Completed your first lesson" },
  ten_lessons: { label: "Getting Going", emoji: "🔥", description: "Completed 10 lessons" },
  fifty_lessons: { label: "Committed", emoji: "💪", description: "Completed 50 lessons" },
  hundred_lessons: { label: "Century", emoji: "🏆", description: "Completed 100 lessons" },
  streak_3: { label: "3-Day Streak", emoji: "⚡", description: "Active 3 days in a row" },
  streak_7: { label: "Week Streak", emoji: "🌟", description: "Active 7 days in a row" },
  streak_30: { label: "Month Streak", emoji: "👑", description: "Active 30 days in a row" },
  multi_roadmap: { label: "Explorer", emoji: "🧭", description: "Active across 3+ roadmaps" },
};
