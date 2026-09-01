import { Router } from "express";
import * as controller from "./notes.controller.js";
import { optionalAuth } from "../../middleware/auth.js";

const router = Router();

router.get("/", optionalAuth, controller.listNotes);
router.get("/:slug", optionalAuth, controller.getNote);

export default router;
