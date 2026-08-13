import { Request, Response } from "express";
import { Resource } from "../../models/Resource.js";
import { RoadmapNode } from "../../models/RoadmapNode.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";

export const createResource = asyncHandler(async (req: Request, res: Response) => {
  const { roadmapSlug, nodeSlug, ...rest } = req.body;
  const node = await RoadmapNode.findOne({ roadmapSlug, slug: nodeSlug });
  if (!node) throw new ApiError(404, "Target station not found");

  const order = await Resource.countDocuments({ nodeId: node._id });
  const resource = await Resource.create({
    ...rest,
    nodeId: node._id,
    roadmapSlug,
    nodeSlug,
    order,
  });
  res.status(201).json({ resource });
});

export const deleteResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await Resource.findByIdAndDelete(req.params.id);
  if (!resource) throw new ApiError(404, "Resource not found");
  res.status(204).send();
});
