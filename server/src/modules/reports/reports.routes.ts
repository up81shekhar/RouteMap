import { Router } from "express";
import { z } from "zod";
import * as controller from "./reports.controller.js";
import { optionalAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";

const router = Router();

const reportSchema = z.object({
  roadmapSlug: z.string().min(1),
  nodeSlug: z.string().min(1),
  resourceTitle: z.string().optional(),
  reason: z.string().min(1).max(1000),
});

router.post("/", optionalAuth, validateBody(reportSchema), controller.reportResource);

export default router;
