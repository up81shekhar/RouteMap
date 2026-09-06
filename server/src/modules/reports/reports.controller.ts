import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { env } from "../../config/env.js";
import { sendResourceReportEmail } from "../../utils/email.js";
import { User } from "../../models/User.js";

export const reportResource = asyncHandler(async (req: Request, res: Response) => {
  const { roadmapSlug, nodeSlug, resourceTitle, reason } = req.body;
  const reporterEmail = req.user ? (await User.findById(req.user.id).select("email"))?.email : undefined;

  if (env.ADMIN_EMAIL) {
    await sendResourceReportEmail(env.ADMIN_EMAIL, { roadmapSlug, nodeSlug, resourceTitle, reason, reporterEmail });
  } else {
    // No ADMIN_EMAIL configured — still succeed for the user, just log it
    // server-side so the report isn't silently lost.
    console.log("[report]", { roadmapSlug, nodeSlug, resourceTitle, reason, reporterEmail });
  }

  res.json({ ok: true });
});
