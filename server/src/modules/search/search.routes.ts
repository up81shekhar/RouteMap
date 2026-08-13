import { Router } from "express";
import * as controller from "./search.controller.js";

const router = Router();

router.get("/", controller.search);

export default router;
