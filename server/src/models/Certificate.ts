import { Schema, model, InferSchemaType } from "mongoose";
import crypto from "node:crypto";

const certificateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    roadmapSlug: { type: String, required: true },
    roadmapTitle: { type: String, required: true }, // snapshot at issue time
    studentName: { type: String, required: true }, // snapshot at issue time
    verifySlug: { type: String, required: true, unique: true, default: () => crypto.randomBytes(8).toString("hex") },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

certificateSchema.index({ userId: 1, roadmapSlug: 1 }, { unique: true });

export type CertificateDoc = InferSchemaType<typeof certificateSchema>;
export const Certificate = model("Certificate", certificateSchema);
