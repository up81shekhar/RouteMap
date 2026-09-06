import { Schema, model, InferSchemaType } from "mongoose";

const bookmarkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // A stable identifier for the bookmarked thing, e.g. "roadmap:dsa",
    // "topic:dsa/arrays", "note:python-notes" — lets one collection cover
    // every bookmarkable item type without a model per type.
    key: { type: String, required: true },
    type: { type: String, enum: ["roadmap", "topic", "note"], required: true },
    title: { type: String, required: true }, // snapshot at bookmark time, so the Saved list works even if the source is renamed later
    path: { type: String, required: true }, // frontend route to link to
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, key: 1 }, { unique: true });

export type BookmarkDoc = InferSchemaType<typeof bookmarkSchema>;
export const Bookmark = model("Bookmark", bookmarkSchema);
