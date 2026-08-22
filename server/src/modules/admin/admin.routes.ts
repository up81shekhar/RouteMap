import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { validateBody } from "../../middleware/validate.js";
import * as roadmapsController from "../roadmaps/roadmaps.controller.js";
import * as resourcesController from "../resources/resources.controller.js";
import * as practiceController from "../practice/practice.controller.js";

const router = Router();

router.use(requireAuth, requireAdmin);

const roadmapSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  category: z.enum(["tech", "exam", "school", "skill"]),
  color: z.enum(["coral", "teal", "violet", "amber"]),
  estimatedDurationHours: z.number().positive(),
  prerequisites: z.array(z.string()).default([]),
  careerOutcomes: z.array(z.string()).default([]),
});

const roadmapUpdateSchema = roadmapSchema.partial();

const nodeSchema = z.object({
  title: z.string().min(1),
  estimatedHours: z.number().positive(),
});

const nodeUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  estimatedHours: z.number().positive().optional(),
});

const moveSchema = z.object({ direction: z.enum(["up", "down"]) });

const resourceSchema = z.object({
  roadmapSlug: z.string().min(1),
  nodeSlug: z.string().min(1),
  type: z.enum(["video", "article", "practice"]),
  tag: z.enum(["recommended", "alternative", "quick", "deep_dive", "hindi"]),
  title: z.string().min(1),
  source: z.string().min(1),
  language: z.enum(["English", "Hindi", "Hinglish"]),
  url: z.string().url().optional(),
  videoId: z.string().optional(),
  durationMinutes: z.number().positive().optional(),
  lessonIndex: z.number().int().min(0).optional(),
});

const practiceQuestionSchema = z.object({
  roadmapSlug: z.string().min(1),
  nodeSlug: z.string().min(1),
  type: z.enum(["mcq", "coding", "concept", "interview"]).default("mcq"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  prompt: z.string().min(1),
  options: z.array(z.string()).default([]),
  correctAnswer: z.string().min(1),
  explanation: z.string().default(""),
});

// Roadmaps
router.post("/roadmaps", validateBody(roadmapSchema), roadmapsController.createRoadmap);
router.put("/roadmaps/:slug", validateBody(roadmapUpdateSchema), roadmapsController.updateRoadmap);
router.patch("/roadmaps/:slug/publish", roadmapsController.togglePublish);
router.delete("/roadmaps/:slug", roadmapsController.deleteRoadmap);

// Nodes (stations)
router.post("/roadmaps/:slug/nodes", validateBody(nodeSchema), roadmapsController.addNode);
router.put("/roadmaps/:slug/nodes/:nodeSlug", validateBody(nodeUpdateSchema), roadmapsController.updateNode);
router.delete("/roadmaps/:slug/nodes/:nodeSlug", roadmapsController.deleteNode);
router.patch("/roadmaps/:slug/nodes/:nodeSlug/move", validateBody(moveSchema), roadmapsController.moveNode);

// Resources
router.post("/resources", validateBody(resourceSchema), resourcesController.createResource);
router.delete("/resources/:id", resourcesController.deleteResource);

// Practice questions
router.post("/practice", validateBody(practiceQuestionSchema), practiceController.addPracticeQuestion);
router.delete("/practice/:id", practiceController.deletePracticeQuestion);

export default router;
