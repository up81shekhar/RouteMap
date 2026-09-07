import { Router } from "express";
import { z } from "zod";
import * as controller from "./bookmarks.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";

const router = Router();

const bookmarkSchema = z.object({
  key: z.string().min(1),
  type: z.enum(["roadmap", "topic", "note"]),
  title: z.string().min(1),
  path: z.string().min(1),
});

router.get("/", requireAuth, controller.listBookmarks);
router.post("/", requireAuth, validateBody(bookmarkSchema), controller.addBookmark);
router.delete("/:key", requireAuth, controller.removeBookmark);

export default router;
