import { Router } from "express";
import { optionalAuth } from "../../middleware/auth.js";
import * as controller from "./roadmaps.controller.js";

const router = Router();

router.get("/", optionalAuth, controller.listRoadmaps);
router.get("/:slug", optionalAuth, controller.getRoadmap);

export default router;
