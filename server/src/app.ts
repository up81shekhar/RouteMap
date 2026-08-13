import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

import authRoutes from "./modules/auth/auth.routes.js";
import roadmapsRoutes from "./modules/roadmaps/roadmaps.routes.js";
import topicsRoutes from "./modules/topics/topics.routes.js";
import progressRoutes from "./modules/progress/progress.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
if (env.NODE_ENV !== "test") app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const searchLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });

app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/roadmaps", roadmapsRoutes);
app.use("/api/topics", topicsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/search", searchLimiter, searchRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
