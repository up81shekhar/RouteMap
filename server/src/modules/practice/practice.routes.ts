import { Router } from "express";
import * as controller from "./practice.controller.js";

const router = Router();

router.get("/:roadmapSlug/:nodeSlug", controller.getPracticeForTopic);

export default router;
