import { model, Schema, type Types } from "mongoose";

export interface IComment {
	content: string;
	postId: Types.ObjectId;
	userId: Types.ObjectId;
	tenantId: string;
}

export const commentSchema = new Schema<IComment>(
	{
		content: { type: String, required: true, trim: true },
		postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		tenantId: { type: String, required: true, index: true },
	},
	{ timestamps: true },
);

export const Comment = model<IComment>("Comment", commentSchema);
