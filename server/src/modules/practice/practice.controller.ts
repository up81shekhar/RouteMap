import { Request, Response } from "express";
import { PracticeQuestion } from "../../models/PracticeQuestion.js";
import { RoadmapNode } from "../../models/RoadmapNode.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";

export const getPracticeForTopic = asyncHandler(async (req: Request, res: Response) => {
  const { roadmapSlug, nodeSlug } = req.params;
  const questions = await PracticeQuestion.find({ roadmapSlug, nodeSlug }).sort({ order: 1 });
  res.json({ questions });
});

export const addPracticeQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { roadmapSlug, nodeSlug, ...rest } = req.body;
  const node = await RoadmapNode.findOne({ roadmapSlug, slug: nodeSlug });
  if (!node) throw new ApiError(404, "Target station not found");

  const order = await PracticeQuestion.countDocuments({ nodeId: node._id });
  const question = await PracticeQuestion.create({ ...rest, nodeId: node._id, roadmapSlug, nodeSlug, order });
  res.status(201).json({ question });
});

export const deletePracticeQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await PracticeQuestion.findByIdAndDelete(req.params.id);
  if (!question) throw new ApiError(404, "Question not found");
  res.status(204).send();
});
