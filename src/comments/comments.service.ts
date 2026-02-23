import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Comment, type IComment } from "../models/comment.model";

interface CreateCommentDto {
	content?: string;
	postId?: string;
}

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
		console.log("Creating comment with:", {
			content: createCommentDto.content,
			postId: createCommentDto.postId,
			userId,
			tenantId,
		});

		const trimmedContent = createCommentDto.content?.trim();
		if (!trimmedContent || trimmedContent.length === 0) {
			throw new BadRequestException("Comment content cannot be empty");
		}

		try {
			const comment = new this.commentModel({
				content: trimmedContent,
				postId: new Types.ObjectId(createCommentDto.postId),
				userId: new Types.ObjectId(userId),
				tenantId,
			});

			return await comment.save();
		} catch (error) {
			if ((error as { code?: number }).code === 11000) {
				console.error("Duplicate key error:", (error as Error).message);
				throw new BadRequestException("A comment with this ID already exists");
			}
			throw error;
		}
	}

	async findByPost(postId: string, tenantId: string): Promise<IComment[]> {
		// If tenantId is provided, filter by it; otherwise fetch all comments for the post
		const query = tenantId
			? { postId: new Types.ObjectId(postId), tenantId }
			: { postId: new Types.ObjectId(postId) };
		return this.commentModel
			.find(query)
			.populate("userId", "name avatar")
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
		// If tenantId is provided, filter by it; otherwise count all comments for the post
		const query = tenantId
			? { postId: new Types.ObjectId(postId), tenantId }
			: { postId: new Types.ObjectId(postId) };
		return this.commentModel.countDocuments(query);
	}
}
