import { model, Schema, Types } from "mongoose";

export interface IPost {
  title: string;
  content: string;
  status: "draft" | "published" | "unpublished";
  slug: string;
  userId: Types.ObjectId;
  tenantId: string;
  category: string;
  image?: string;
  isPublic: boolean;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "unpublished"],
      default: "draft",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Post = model<IPost>("Post", postSchema);