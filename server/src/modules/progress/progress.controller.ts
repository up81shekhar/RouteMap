import { Request, Response } from "express";
import { UserProgress } from "../../models/UserProgress.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getProgress = asyncHandler(async (req: Request, res: Response) => {
  const { roadmapSlug, nodeSlug } = req.query as { roadmapSlug?: string; nodeSlug?: string };
  const filter: Record<string, unknown> = { userId: req.user!.id };
  if (roadmapSlug) filter.roadmapSlug = roadmapSlug;
  if (nodeSlug) filter.nodeSlug = nodeSlug;

  const progress = await UserProgress.find(filter);
  res.json({ progress });
});

export const markLessonComplete = asyncHandler(async (req: Request, res: Response) => {
  const { roadmapSlug, nodeSlug, lessonIndex } = req.body;

  const progress = await UserProgress.findOneAndUpdate(
    { userId: req.user!.id, roadmapSlug, nodeSlug },
    {
      $addToSet: { completedLessonIndices: lessonIndex },
      $set: { lastActivityAt: new Date() },
    },
    { upsert: true, new: true }
  );
  res.json({ progress });
});
