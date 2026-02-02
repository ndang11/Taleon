import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import { Comment, type IComment } from "src/models/comment.model";
import type { CreateCommentDto } from "./dto/create-comment.dto";

@Injectable()
export class CommentsService {
	constructor(
		@InjectModel(Comment.name) private commentModel: Model<IComment>,
	) {}

	async create(
		createCommentDto: CreateCommentDto,
		userId: string,
		tenantId: string,
	): Promise<IComment> {
		const comment = new this.commentModel({
			...createCommentDto,
			postId: new Types.ObjectId(createCommentDto.postId),
			userId: new Types.ObjectId(userId),
			tenantId,
		});

		return comment.save();
	}

	async findByPost(postId: string, tenantId: string): Promise<IComment[]> {
		return this.commentModel
			.find({ postId: new Types.ObjectId(postId), tenantId })
			.populate("userId", "name")
			.sort({ createdAt: 1 });
	}

	async remove(id: string, userId: string, tenantId: string): Promise<void> {
		const comment = await this.commentModel.findOne({
			_id: id,
			tenantId,
			userId: new Types.ObjectId(userId),
		});
		if (!comment) {
			throw new NotFoundException(
				"Comment not found or you don't have permission to delete it",
			);
		}

		await this.commentModel.deleteOne({ _id: id });
	}

	async getCommentCount(postId: string, tenantId: string): Promise<number> {
		return this.commentModel.countDocuments({
			postId: new Types.ObjectId(postId),
			tenantId,
		});
	}
}
