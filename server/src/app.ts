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
import practiceRoutes from "./modules/practice/practice.routes.js";
import sitemapRoutes from "./modules/sitemap/sitemap.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

export const app = express();

// CLIENT_ORIGIN can be a single URL or a comma-separated list (handy for
// supporting both a production domain and Vercel preview deployments).
// Trailing slashes are stripped before comparing, since "https://x.com" and
// "https://x.com/" are the same origin but fail a naive exact-string match —
// a mismatch here is the most common cause of "CORS error" in the browser
// even when CLIENT_ORIGIN was set "correctly".
const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, ""));
console.log("CORS allowed origins:", allowedOrigins);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // same-origin, curl, server-to-server, etc.
      const normalized = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalized)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS. Allowed: ${allowedOrigins.join(", ")}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
if (env.NODE_ENV !== "test") app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const searchLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString(), allowedOrigins })
);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/roadmaps", roadmapsRoutes);
app.use("/api/topics", topicsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/search", searchLimiter, searchRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/sitemap.xml", sitemapRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
