import { Request, Response } from "express";
import { RoadmapNode } from "../../models/RoadmapNode.js";
import { Resource } from "../../models/Resource.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";

export const getTopic = asyncHandler(async (req: Request, res: Response) => {
  const { roadmapSlug, nodeSlug } = req.params;
  const node = await RoadmapNode.findOne({ roadmapSlug, slug: nodeSlug });
  if (!node) throw new ApiError(404, "Topic not found");

  const resources = await Resource.find({ nodeId: node._id, isPublished: true }).sort({ order: 1 });
  res.json({ node, resources });
});
