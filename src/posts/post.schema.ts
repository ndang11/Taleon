import { type Document, Schema } from "mongoose";

export const POST_MODEL = "Post";

export interface Post extends Document {
	title: string;
	content: string;
	tenantId: string;
	createdAt: Date;
	updatedAt: Date;
}

export const PostSchema = new Schema<Post>(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		tenantId: { type: String, required: true },
	},
	{ timestamps: true },
);
