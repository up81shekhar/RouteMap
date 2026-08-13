import { Request, Response } from "express";
import { Roadmap } from "../../models/Roadmap.js";
import { UserProgress } from "../../models/UserProgress.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const [roadmaps, progress] = await Promise.all([
    Roadmap.find({ isPublished: true }).sort({ createdAt: 1 }).limit(5),
    UserProgress.find({ userId: req.user!.id }).sort({ lastActivityAt: -1 }).limit(10),
  ]);

  res.json({ roadmaps, recentProgress: progress });
});
