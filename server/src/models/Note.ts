import { Schema, model, InferSchemaType } from "mongoose";

const noteSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true }, // short summary, used for cards + SEO meta
    category: { type: String, required: true }, // free-text subject/tag, e.g. "DSA", "Class 12 Physics"
    content: { type: String, default: "" }, // markdown body — optional, notes can be attachment-only
    attachmentUrl: { type: String, default: "" }, // external link for now (Cloudinary URL once wired up)
    attachmentType: { type: String, enum: ["pdf", "image", ""], default: "" },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    // Set only for a college's private notes — visible exclusively to that
    // institution's students, not the public /notes library.
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null },
  },
  { timestamps: true }
);

export type NoteDoc = InferSchemaType<typeof noteSchema>;
export const Note = model("Note", noteSchema);
