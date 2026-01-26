import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import { type ILike, Like } from "../models/like.model";

@Injectable()
export class LikesService {
	constructor(@InjectModel(Like.name) private likeModel: Model<ILike>) {}

	async toggleLike(
		postId: string,
		userId: string,
		tenantId: string,
	): Promise<{ liked: boolean; likeCount: number }> {
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
			const like = new this.likeModel({
				postId: new Types.ObjectId(postId),
				userId: new Types.ObjectId(userId),
				tenantId,
			});
			await like.save();
			const likeCount = await this.getLikeCount(postId, tenantId);
			return { liked: true, likeCount };
		}
	}

	async getLikeCount(postId: string, tenantId?: string): Promise<number> {
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
		const like = await this.likeModel.findOne({
			postId: new Types.ObjectId(postId),
			userId: new Types.ObjectId(userId),
			tenantId,
		});
		return !!like;
	}
}
