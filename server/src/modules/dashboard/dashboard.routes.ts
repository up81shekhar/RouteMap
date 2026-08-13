import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as controller from "./dashboard.controller.js";

const router = Router();

router.get("/", requireAuth, controller.getDashboard);

export default router;
