import { Request, Response } from "express";
import { Roadmap } from "../../models/Roadmap.js";
import { RoadmapNode } from "../../models/RoadmapNode.js";
import { Resource } from "../../models/Resource.js";
import { asyncHandler, ApiError } from "../../utils/asyncHandler.js";
import { slugify } from "../../utils/slugify.js";

// ---- Public ----

export const listRoadmaps = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === "admin";
  const filter = isAdmin ? {} : { isPublished: true };
  const roadmaps = await Roadmap.find(filter).sort({ createdAt: 1 });

  const counts = await RoadmapNode.aggregate([
    { $match: { roadmapId: { $in: roadmaps.map((r) => r._id) } } },
    { $group: { _id: "$roadmapId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  res.json({
    roadmaps: roadmaps.map((r) => ({ ...r.toObject(), nodeCount: countMap.get(String(r._id)) ?? 0 })),
  });
});

export const getRoadmap = asyncHandler(async (req: Request, res: Response) => {
  const roadmap = await Roadmap.findOne({ slug: req.params.slug });
  if (!roadmap) throw new ApiError(404, "Roadmap not found");

  const isAdmin = req.user?.role === "admin";
  if (!roadmap.isPublished && !isAdmin) throw new ApiError(404, "Roadmap not found");

  const nodes = await RoadmapNode.find({ roadmapId: roadmap._id }).sort({ order: 1 });
  res.json({ roadmap, nodes });
});

// ---- Admin ----

export const createRoadmap = asyncHandler(async (req: Request, res: Response) => {
  const { title, ...rest } = req.body;
  const existingSlugs = (await Roadmap.find({}, "slug")).map((r) => r.slug);
  let slug = slugify(title);
  let i = 2;
  while (existingSlugs.includes(slug)) slug = `${slugify(title)}-${i++}`;

  const count = await Roadmap.countDocuments();
  const roadmap = await Roadmap.create({
    ...rest,
    title,
    slug,
    lineCode: `L${count + 1}`,
    isPublished: false,
  });
  res.status(201).json({ roadmap });
});

export const updateRoadmap = asyncHandler(async (req: Request, res: Response) => {
  const roadmap = await Roadmap.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
  if (!roadmap) throw new ApiError(404, "Roadmap not found");
  res.json({ roadmap });
});

export const togglePublish = asyncHandler(async (req: Request, res: Response) => {
  const roadmap = await Roadmap.findOne({ slug: req.params.slug });
  if (!roadmap) throw new ApiError(404, "Roadmap not found");
  roadmap.isPublished = !roadmap.isPublished;
  await roadmap.save();
  res.json({ roadmap });
});

export const deleteRoadmap = asyncHandler(async (req: Request, res: Response) => {
  const roadmap = await Roadmap.findOneAndDelete({ slug: req.params.slug });
  if (!roadmap) throw new ApiError(404, "Roadmap not found");
  const nodes = await RoadmapNode.find({ roadmapId: roadmap._id });
  await Resource.deleteMany({ nodeId: { $in: nodes.map((n) => n._id) } });
  await RoadmapNode.deleteMany({ roadmapId: roadmap._id });
  res.status(204).send();
});

// ---- Admin: nodes (stations) nested under a roadmap ----

export const addNode = asyncHandler(async (req: Request, res: Response) => {
  const roadmap = await Roadmap.findOne({ slug: req.params.slug });
  if (!roadmap) throw new ApiError(404, "Roadmap not found");

  const { title, estimatedHours } = req.body;
  const existing = (await RoadmapNode.find({ roadmapId: roadmap._id }, "slug")).map((n) => n.slug);
  let slug = slugify(title);
  let i = 2;
  while (existing.includes(slug)) slug = `${slugify(title)}-${i++}`;

  const order = await RoadmapNode.countDocuments({ roadmapId: roadmap._id });
  const node = await RoadmapNode.create({
    roadmapId: roadmap._id,
    roadmapSlug: roadmap.slug,
    slug,
    title,
    estimatedHours,
    order,
    isPublished: true,
  });
  res.status(201).json({ node });
});

export const updateNode = asyncHandler(async (req: Request, res: Response) => {
  const node = await RoadmapNode.findOneAndUpdate(
    { roadmapSlug: req.params.slug, slug: req.params.nodeSlug },
    req.body,
    { new: true }
  );
  if (!node) throw new ApiError(404, "Station not found");
  res.json({ node });
});

export const deleteNode = asyncHandler(async (req: Request, res: Response) => {
  const node = await RoadmapNode.findOneAndDelete({ roadmapSlug: req.params.slug, slug: req.params.nodeSlug });
  if (!node) throw new ApiError(404, "Station not found");
  await Resource.deleteMany({ nodeId: node._id });
  res.status(204).send();
});

export const moveNode = asyncHandler(async (req: Request, res: Response) => {
  const { direction } = req.body as { direction: "up" | "down" };
  const nodes = await RoadmapNode.find({ roadmapSlug: req.params.slug }).sort({ order: 1 });
  const idx = nodes.findIndex((n) => n.slug === req.params.nodeSlug);
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapWith < 0 || swapWith >= nodes.length) throw new ApiError(400, "Cannot move further");

  const a = nodes[idx];
  const b = nodes[swapWith];
  const aOrder = a.order;
  a.order = b.order;
  b.order = aOrder;
  await a.save();
  await b.save();
  res.json({ ok: true });
});
