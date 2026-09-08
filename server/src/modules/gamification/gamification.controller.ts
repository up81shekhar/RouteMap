import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getStats } from "../../services/gamification.service.js";

export const getMyStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await getStats(req.user!.id);
  res.json(stats);
});
