import { Router } from "express";
import * as controller from "./notes.controller.js";

const router = Router();

router.get("/", controller.listNotes);
router.get("/:slug", controller.getNote);

export default router;
