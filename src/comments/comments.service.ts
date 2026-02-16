import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import { Comment, type IComment } from "../models/comment.model";
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
		console.log("Creating comment with:", {
			content: createCommentDto.content,
			postId: createCommentDto.postId,
			userId,
			tenantId,
		});

		// Validate input - ensure content exists and is not just whitespace
		const trimmedContent = createCommentDto.content?.trim();
		if (!trimmedContent || trimmedContent.length === 0) {
			throw new BadRequestException("Comment content cannot be empty");
		}

		const comment = new this.commentModel({
			content: trimmedContent,
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
