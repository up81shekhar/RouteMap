import { Schema, model, InferSchemaType } from "mongoose";

const institutionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    // Students enter this to link their account to the institution —
    // short, shareable (e.g. "DELHI-CS24"), regenerable by the admin.
    joinCode: { type: String, required: true, unique: true },
    adminUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Self-service delete (e.g. a student who accidentally set up an
    // institution) requires an emailed OTP before it takes effect.
    deleteOtpHash: { type: String, default: null },
    deleteOtpExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type InstitutionDoc = InferSchemaType<typeof institutionSchema>;
export const Institution = model("Institution", institutionSchema);
