import { Router } from "express";
import * as controller from "./topics.controller.js";

const router = Router();

router.get("/:roadmapSlug/:nodeSlug", controller.getTopic);

export default router;
