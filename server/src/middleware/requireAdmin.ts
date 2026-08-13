import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/asyncHandler.js";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw new ApiError(401, "Authentication required");
  if (req.user.role !== "admin") throw new ApiError(403, "Admin access required");
  next();
}
