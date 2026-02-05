import { model, Schema, type Types } from "mongoose";

export interface ILike {
	postId: Types.ObjectId;
	userId: Types.ObjectId;
	tenantId: string;
}

const likeSchema = new Schema<ILike>(
	{
		postId: {
			type: Schema.Types.ObjectId,
			ref: "Post",
			required: true,
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
	},
	{ timestamps: true },
);

// Compound index to ensure a user can like a post only once
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = model<ILike>("Like", likeSchema);
export const LikeSchema = likeSchema;
