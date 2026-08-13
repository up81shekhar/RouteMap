import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import * as controller from "./progress.controller.js";

const router = Router();

const markCompleteSchema = z.object({
  roadmapSlug: z.string().min(1),
  nodeSlug: z.string().min(1),
  lessonIndex: z.number().int().min(0),
});

router.get("/", requireAuth, controller.getProgress);
router.post("/", requireAuth, validateBody(markCompleteSchema), controller.markLessonComplete);

export default router;
