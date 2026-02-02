import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as crypto from "crypto";
import { type Model, Types } from "mongoose";
import slugify from "slugify";
import { PostContent } from "src/interfaces/post.type";
import { calculateReadingTime } from "src/lib/post-helper";
import { Post, type PostDocument } from "src/schemas/post.schema";
import { CommentsService } from "../comments/comments.service";
import { TenantBaseService } from "../common/services/tenant-base.service";
import { LikesService } from "../likes/likes.service";
import type { CreatePostDto } from "./dto/create-post.dto";

@Injectable()
export class PostsService extends TenantBaseService<PostDocument> {
	constructor(
		@InjectModel(Post.name) private postModel: Model<PostDocument>,
		private commentsService: CommentsService,
		private likesService: LikesService,
	) {
		super(postModel);
	}

	async publish(
		tenantId: string,
		userId: string,
		postId: string,
	): Promise<PostDocument> {
		const postObjectId = new Types.ObjectId(postId);
		const tenantObjectId = new Types.ObjectId(tenantId);
		const userObjectId = new Types.ObjectId(userId);

		const post = await this.postModel.findOne({
			_id: postObjectId,
			tenantId: tenantObjectId,
			authorId: userObjectId,
		});

		if (!post) {
			throw new NotFoundException("Post not found or unauthorized");
		}

		if (!post.title || post.wordCount === 0) {
			throw new BadRequestException(
				"Cannot publish an empty post without a title or content",
			);
		}

		post.status = "published";
		post.publishedAt = new Date();

		return post.save();
	}

	async updateDraft(
		tenantId: string,
		userId: string,
		postId: string,
		data: any,
	) {
		const updatePayload: any = { ...data };

		if (data.content) {
			const { words, minutes } = calculateReadingTime(data.content);
			updatePayload.wordCount = words;
			updatePayload.readingTime = minutes;
		}

		// Convert string IDs to ObjectId for proper querying
		const postObjectId = new Types.ObjectId(postId);
		const tenantObjectId = new Types.ObjectId(tenantId);
		const userObjectId = new Types.ObjectId(userId);

		const updatedPost = await this.postModel
			.findOneAndUpdate(
				{ _id: postObjectId, tenantId: tenantObjectId, authorId: userObjectId },
				{ $set: updatePayload },
				{ new: true }, // THIS 'new: true' is vital to return the document!
			)
			.exec();

		if (!updatedPost) {
			throw new NotFoundException("Post not found or unauthorized");
		}

		return updatedPost;
	}

	async initializeDraft(
		tenantId: string,
		userId: string,
		dto: CreatePostDto,
	): Promise<PostDocument> {
		const shortId = crypto.randomBytes(6).toString("hex");
		const baseSlug = slugify(dto.title, { lower: true, strict: true });
		const fullSlug = `${baseSlug}-${shortId}`;

		const newPost = new this.postModel({
			...dto,
			slug: fullSlug,
			content: { blocks: [] },
			authorId: new Types.ObjectId(userId),
			tenantId: new Types.ObjectId(tenantId),
			status: "draft",
		});

		return newPost.save();
	}

	async getPublishedPosts(page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit;
		const posts = await this.postModel
			.find({ status: "published" })
			.populate("authorId", "name email avatar")
			.sort({ publishedAt: -1 })
			.skip(skip)
			.limit(limit)
			.exec();

		const total = await this.postModel
			.countDocuments({ status: "published" })
			.exec();

		return {
			posts,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getTenantPublishedPosts(
		tenantId: string,
		page: number = 1,
		limit: number = 10,
	) {
		const skip = (page - 1) * limit;
		const tenantObjectId = new Types.ObjectId(tenantId);

		const posts = await this.postModel
			.find({ tenantId: tenantObjectId, status: "published" })
			.populate("authorId", "name email avatar")
			.sort({ publishedAt: -1 })
			.skip(skip)
			.limit(limit)
			.exec();

		const total = await this.postModel
			.countDocuments({ tenantId: tenantObjectId, status: "published" })
			.exec();

		return {
			posts,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getUserPostBySlug(tenantId: string, userId: string, slug: string) {
		return this.postModel.findOne({ tenantId, authorId: userId, slug });
	}

	async getUserPosts(
		tenantId: string,
		userId: string,
		page: number = 1,
		limit: number = 10,
	) {
		const skip = (page - 1) * limit;
		const posts = await this.postModel
			.find({ tenantId, authorId: userId })
			.sort({ updatedAt: -1 })
			.skip(skip)
			.limit(limit)
			.exec();

		// Get like and comment counts for each post
		const postsWithCounts = await Promise.all(
			posts.map(async (post) => {
				try {
					const likeCount = await this.likesService.getLikeCount(
						post._id.toString(),
						tenantId,
					);
					const commentCount = await this.commentsService.getCommentCount(
						post._id.toString(),
						tenantId,
					);
					return {
						...post.toObject(),
						likeCount,
						commentCount,
					};
				} catch (error) {
					console.error(`Error getting counts for post ${post._id}:`, error);
					return {
						...post.toObject(),
						likeCount: 0,
						commentCount: 0,
					};
				}
			}),
		);

		const total = await this.postModel
			.countDocuments({ tenantId, authorId: userId })
			.exec();

		return {
			posts: postsWithCounts,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getPostById(id: string) {
		const post = await this.postModel
			.findById(id)
			.populate("authorId", "name email avatar")
			.exec();

		if (!post) {
			throw new Error("Post not found");
		}

		return post;
	}

	async getPost(id: string) {
		return this.postModel
			.findById(id)
			.populate("authorId", "name email avatar") // This turns the ID into the AuthorInfo object
			.exec();
	}

	async getPublishedPostBySlug(slug: string) {
		const post = await this.postModel
			.findOne({ slug, status: "published" })
			.populate("authorId", "name email avatar")
			.exec();

		if (!post) {
			throw new Error("Post not found");
		}

		return post;
	}

	async delete(
		tenantId: string,
		userId: string,
		postId: string,
	): Promise<{ message: string }> {
		const postObjectId = new Types.ObjectId(postId);
		const tenantObjectId = new Types.ObjectId(tenantId);
		const userObjectId = new Types.ObjectId(userId);

		const post = await this.postModel.findOne({
			_id: postObjectId,
			tenantId: tenantObjectId,
			authorId: userObjectId,
		});

		if (!post) {
			throw new NotFoundException("Post not found or unauthorized");
		}

		await this.postModel.deleteOne({ _id: postObjectId });
		return { message: "Post deleted successfully" };
	}
}
