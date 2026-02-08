import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import { type ILike, Like } from "../models/like.model";

@Injectable()
export class LikesService {
	constructor(@InjectModel("Like") private likeModel: Model<ILike>) {}

	private isValidObjectId(id: string): boolean {
		return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
	}

	async toggleLike(
		postId: string,
		userId: string,
		tenantId: string,
	): Promise<{ liked: boolean; likeCount: number }> {
		// Validate ObjectIds
		if (!this.isValidObjectId(postId) || !this.isValidObjectId(userId)) {
			throw new Error("Invalid postId or userId format");
		}

		const existingLike = await this.likeModel.findOne({
			postId: new Types.ObjectId(postId),
			userId: new Types.ObjectId(userId),
			tenantId,
		});

		if (existingLike) {
			// Unlike
			await this.likeModel.deleteOne({ _id: existingLike._id });
			const likeCount = await this.getLikeCount(postId, tenantId);
			return { liked: false, likeCount };
		} else {
			// Like
			try {
				console.log("Like schema fields:", Object.keys(this.likeModel.schema.paths));
				console.log("Content field required:", this.likeModel.schema.path("content")?.isRequired);
				console.log("Like model name:", this.likeModel.modelName);
				console.log("Creating like with:", { postId, userId, tenantId });
				const like = new this.likeModel({
					postId: new Types.ObjectId(postId),
					userId: new Types.ObjectId(userId),
					tenantId,
				});
				await like.save();
				const likeCount = await this.getLikeCount(postId, tenantId);
				return { liked: true, likeCount };
			} catch (error: any) {
				console.error("Error creating like:", error);
				throw new Error(`Failed to create like: ${error.message}`);
			}
		}
	}

	async getLikeCount(postId: string, tenantId?: string): Promise<number> {
		if (!this.isValidObjectId(postId)) {
			return 0;
		}
		const query: Record<string, unknown> = {
			postId: new Types.ObjectId(postId),
		};
		if (tenantId) {
			query.tenantId = tenantId;
		}
		return this.likeModel.countDocuments(query);
	}

	async hasUserLiked(
		postId: string,
		userId: string,
		tenantId: string,
	): Promise<boolean> {
		if (!this.isValidObjectId(postId) || !this.isValidObjectId(userId)) {
			return false;
		}
		const like = await this.likeModel.findOne({
			postId: new Types.ObjectId(postId),
			userId: new Types.ObjectId(userId),
			tenantId,
		});
		return !!like;
	}
}
