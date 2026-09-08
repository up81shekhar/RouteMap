import { Router } from "express";
import * as controller from "./gamification.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, controller.getMyStats);

export default router;
