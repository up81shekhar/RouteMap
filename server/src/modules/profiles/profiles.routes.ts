import { Router } from "express";
import { z } from "zod";
import * as controller from "./profiles.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";

const router = Router();

router.get("/settings", requireAuth, controller.getMyProfileSettings);
router.put(
  "/settings",
  requireAuth,
  validateBody(z.object({ publicProfile: z.boolean() })),
  controller.updateMyProfileSettings
);
router.get("/:slug", controller.getPublicProfile);

export default router;
