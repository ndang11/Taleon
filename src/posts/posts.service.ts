import * as crypto from "node:crypto";
import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Types } from "mongoose";
import slugify from "slugify";
import { calculateReadingTime } from "src/lib/post-helper";
import { Post, type PostDocument } from "src/schemas/post.schema";
import type { CommentsService } from "../comments/comments.service";
import { TenantBaseService } from "../common/services/tenant-base.service";
import type { LikesService } from "../likes/likes.service";
import type { CreatePostDto } from "./dto/create-post.dto";
import { COMMENTS_SERVICE, LIKES_SERVICE } from "./posts.constants";

interface UpdateDraftData {
	content?: unknown;
	title?: string;
	wordCount?: number;
	readingTime?: number;
}

@Injectable()
export class PostsService extends TenantBaseService<PostDocument> {
	constructor(
		@InjectModel(Post.name) private postModel: Model<PostDocument>,
		@Inject(COMMENTS_SERVICE) private commentsService: CommentsService,
		@Inject(LIKES_SERVICE) private likesService: LikesService,
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
		data: UpdateDraftData,
	) {
		const updatePayload: UpdateDraftData = { ...data };

		if (data.content) {
			// Handle content: convert object to JSON string if needed
			const contentString =
				typeof data.content === "string"
					? data.content
					: JSON.stringify(data.content);
			updatePayload.content = contentString;

			const { words, minutes } = calculateReadingTime(contentString);
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
				{ new: true },
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
		const baseSlug = slugify(dto.title || "untitled", {
			lower: true,
			strict: true,
		});
		const fullSlug = `${baseSlug}-${shortId}`;

		// Handle content: convert object to JSON string if needed
		const contentString =
			typeof dto.content === "string"
				? dto.content
				: typeof dto.content === "object" && dto.content !== null
					? JSON.stringify(dto.content)
					: JSON.stringify(dto.contentObject || { blocks: [] });

		const newPost = new this.postModel({
			title: dto.title || "Untitled Story",
			content: contentString,
			slug: fullSlug,
			authorId: new Types.ObjectId(userId),
			tenantId: new Types.ObjectId(tenantId),
			status: "draft",
			category: dto.category,
			image: dto.image,
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

	async getPublishedPostsByAuthor(authorId: string) {
		const posts = await this.postModel
			.find({ authorId: new Types.ObjectId(authorId), status: "published" })
			.populate("authorId", "name email avatar")
			.sort({ publishedAt: -1 })
			.exec();

		return posts;
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

	async getAllTenantPosts(
		tenantId: string,
		page: number = 1,
		limit: number = 50,
	) {
		const skip = (page - 1) * limit;
		const tenantObjectId = new Types.ObjectId(tenantId);

		const posts = await this.postModel
			.find({ tenantId: tenantObjectId })
			.populate("authorId", "name email avatar")
			.sort({ updatedAt: -1 })
			.skip(skip)
			.limit(limit)
			.exec();

		const total = await this.postModel
			.countDocuments({ tenantId: tenantObjectId })
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
			.populate("authorId", "name email avatar")
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

	async incrementView(postId: string): Promise<PostDocument> {
		const post = await this.postModel.findByIdAndUpdate(
			postId,
			{ $inc: { viewCount: 1 } },
			{ new: true },
		);

		if (!post) {
			throw new NotFoundException("Post not found");
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

	async archivePost(
		tenantId: string,
		userId: string,
		postId: string,
		data: { content?: unknown; title?: string; image?: string },
	): Promise<PostDocument> {
		const postObjectId = new Types.ObjectId(postId);
		const tenantObjectId = new Types.ObjectId(tenantId);
		const userObjectId = new Types.ObjectId(userId);

		const updatePayload: Record<string, unknown> = { status: "archived" };

		if (data.content) {
			const contentString =
				typeof data.content === "string"
					? data.content
					: JSON.stringify(data.content);
			updatePayload.content = contentString;

			const { words, minutes } = calculateReadingTime(contentString);
			updatePayload.wordCount = words;
			updatePayload.readingTime = minutes;
		}

		if (data.title) {
			updatePayload.title = data.title;
		}

		if (data.image) {
			updatePayload.image = data.image;
		}

		const archivedPost = await this.postModel
			.findOneAndUpdate(
				{ _id: postObjectId, tenantId: tenantObjectId, authorId: userObjectId },
				{ $set: updatePayload },
				{ new: true },
			)
			.exec();

		if (!archivedPost) {
			throw new NotFoundException("Post not found or unauthorized");
		}

		return archivedPost;
	}

	async getUserDrafts(
		tenantId: string,
		userId: string,
		page: number = 1,
		limit: number = 20,
	) {
		const skip = (page - 1) * limit;
		const tenantObjectId = new Types.ObjectId(tenantId);
		const userObjectId = new Types.ObjectId(userId);

		const posts = await this.postModel
			.find({
				tenantId: tenantObjectId,
				authorId: userObjectId,
				status: "draft",
			})
			.sort({ updatedAt: -1 })
			.skip(skip)
			.limit(limit)
			.exec();

		const total = await this.postModel
			.countDocuments({
				tenantId: tenantObjectId,
				authorId: userObjectId,
				status: "draft",
			})
			.exec();

		return { posts, total, page, limit };
	}

	async getUserArchived(
		tenantId: string,
		userId: string,
		page: number = 1,
		limit: number = 20,
	) {
		const skip = (page - 1) * limit;
		const tenantObjectId = new Types.ObjectId(tenantId);
		const userObjectId = new Types.ObjectId(userId);

		const posts = await this.postModel
			.find({
				tenantId: tenantObjectId,
				authorId: userObjectId,
				status: "archived",
			})
			.sort({ updatedAt: -1 })
			.skip(skip)
			.limit(limit)
			.exec();

		const total = await this.postModel
			.countDocuments({
				tenantId: tenantObjectId,
				authorId: userObjectId,
				status: "archived",
			})
			.exec();

		return { posts, total, page, limit };
	}
}
