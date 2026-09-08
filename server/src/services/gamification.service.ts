import { UserActivityDay } from "../models/UserActivityDay.js";
import { UserBadge } from "../models/UserBadge.js";
import { UserProgress } from "../models/UserProgress.js";

function todayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function dateNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function computeStreak(userId: string): Promise<number> {
  const days = await UserActivityDay.find({ userId }).select("date").sort({ date: -1 }).limit(400);
  const dateSet = new Set(days.map((d) => d.date));

  let streak = 0;
  let cursor = todayString();
  // If today has no activity yet (this call happens right after recording
  // it, so it always will), start counting from today; otherwise a user
  // who was active yesterday but not yet today would show streak 0 instead
  // of "still alive, do something today to keep it".
  while (dateSet.has(cursor)) {
    streak++;
    cursor = dateNDaysAgo(streak);
  }
  return streak;
}

const BADGE_DEFS = [
  { id: "first_lesson", check: (s: Stats) => s.totalLessonsCompleted >= 1 },
  { id: "ten_lessons", check: (s: Stats) => s.totalLessonsCompleted >= 10 },
  { id: "fifty_lessons", check: (s: Stats) => s.totalLessonsCompleted >= 50 },
  { id: "hundred_lessons", check: (s: Stats) => s.totalLessonsCompleted >= 100 },
  { id: "streak_3", check: (s: Stats) => s.streak >= 3 },
  { id: "streak_7", check: (s: Stats) => s.streak >= 7 },
  { id: "streak_30", check: (s: Stats) => s.streak >= 30 },
  { id: "multi_roadmap", check: (s: Stats) => s.distinctRoadmaps >= 3 },
];

type Stats = { totalLessonsCompleted: number; streak: number; distinctRoadmaps: number };

export async function getStats(userId: string): Promise<Stats & { badges: string[] }> {
  const progress = await UserProgress.find({ userId });
  const totalLessonsCompleted = progress.reduce((sum, p) => sum + p.completedLessonIndices.length, 0);
  const distinctRoadmaps = new Set(progress.map((p) => p.roadmapSlug)).size;
  const streak = await computeStreak(userId);
  const badges = (await UserBadge.find({ userId }).select("badgeId")).map((b) => b.badgeId);
  return { totalLessonsCompleted, distinctRoadmaps, streak, badges };
}

/** Call this whenever a user completes a lesson. Records today's activity and
 *  returns any badges newly earned as a result (empty array most of the time). */
export async function recordActivityAndCheckBadges(userId: string): Promise<string[]> {
  await UserActivityDay.updateOne(
    { userId, date: todayString() },
    { $setOnInsert: { userId, date: todayString() } },
    { upsert: true }
  );

  const stats = await getStats(userId);
  const alreadyEarned = new Set(stats.badges);
  const newlyEarned: string[] = [];

  for (const def of BADGE_DEFS) {
    if (!alreadyEarned.has(def.id) && def.check(stats)) {
      try {
        await UserBadge.create({ userId, badgeId: def.id });
        newlyEarned.push(def.id);
      } catch {
        // race with a concurrent request already awarding it — fine, ignore
      }
    }
  }

  return newlyEarned;
}
