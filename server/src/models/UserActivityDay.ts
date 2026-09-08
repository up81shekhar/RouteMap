import { Schema, model, InferSchemaType } from "mongoose";

const userActivityDaySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // "YYYY-MM-DD", server's local date at time of activity
  },
  { timestamps: true }
);

userActivityDaySchema.index({ userId: 1, date: 1 }, { unique: true });

export type UserActivityDayDoc = InferSchemaType<typeof userActivityDaySchema>;
export const UserActivityDay = model("UserActivityDay", userActivityDaySchema);
