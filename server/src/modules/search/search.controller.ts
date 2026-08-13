import { Request, Response } from "express";
import { Roadmap } from "../../models/Roadmap.js";
import { RoadmapNode } from "../../models/RoadmapNode.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) throw new ApiError(400, "Missing query parameter 'q'");

  const regex = new RegExp(q.split(/\s+/).join("|"), "i");

  const [roadmaps, topics] = await Promise.all([
    Roadmap.find({ isPublished: true, $or: [{ title: regex }, { description: regex }] }).limit(10),
    RoadmapNode.find({ isPublished: true, $or: [{ title: regex }, { tags: regex }] }).limit(15),
  ]);

  res.json({ roadmaps, topics });
});
