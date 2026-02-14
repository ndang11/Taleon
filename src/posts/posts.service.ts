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
import type { CommentsService } from "../comments/comments.service";
import { TenantBaseService } from "../common/services/tenant-base.service";
import { calculateReadingTime } from "../lib/post-helper";
import type { LikesService } from "../likes/likes.service";
import { Post, type PostDocument } from "../schemas/post.schema";
import type { CreatePostDto } from "./dto/create-post.dto";
import { COMMENTS_SERVICE, LIKES_SERVICE } from "./posts.constants";

interface UpdateDraftData {
	content?: string | Record<string, unknown>;
	title?: string;
	wordCount?: number;
	readingTime?: number;
	status?: "draft" | "published" | "unpublished" | "archived";
	image?: string;
	coverImage?: string;
}

@Injectable()
export class PostsService extends TenantBaseService<PostDocument> {
	/**
	 * Safely get a preview of content for logging
	 */
	private safeContentPreview(
		content: string | Record<string, unknown> | null | undefined,
	): string {
		if (content === null || content === undefined) {
			return "(empty)";
		}
		if (typeof content === "string") {
			try {
				return content.substring(0, 100) || "(empty string)";
			} catch {
				return "(error getting substring)";
			}
		}
		try {
			return JSON.stringify(content).substring(0, 100);
		} catch {
			return "(non-serializable)";
		}
	}

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
		data?: { title?: string; content?: string | Record<string, unknown> },
	): Promise<PostDocument> {
		const postObjectId = new Types.ObjectId(postId);
		const tenantObjectId = new Types.ObjectId(tenantId);
		const userObjectId = new Types.ObjectId(userId);

		console.log("[DEBUG publish] Called with postId:", postId);
		console.log(
			"[DEBUG publish] Received data:",
			JSON.stringify(data, null, 2),
		);

		const post = await this.postModel.findOne({
			_id: postObjectId,
			tenantId: tenantObjectId,
			authorId: userObjectId,
		});

		if (!post) {
			throw new NotFoundException("Post not found or unauthorized");
		}

		console.log("[DEBUG publish] Current post.title:", post.title);
		console.log(
			"[DEBUG publish] Current post.content:",
			this.safeContentPreview(post.content),
		);

		// Use data.title if provided, otherwise keep existing post.title
		const finalTitle =
			data?.title !== undefined && data?.title !== null
				? data.title
				: post.title;
		// Use data.content if provided, otherwise keep existing post.content
		const finalContent =
			data?.content !== undefined && data?.content !== null
				? data.content
				: post.content;

		console.log("[DEBUG publish] finalTitle:", finalTitle);
		console.log("[DEBUG publish] finalContent type:", typeof finalContent);
		console.log(
			"[DEBUG publish] finalContent:",
			this.safeContentPreview(
				finalContent as string | Record<string, unknown> | null | undefined,
			),
		);

		// Calculate word count from finalContent
		let wordCount = 0;
		if (typeof finalContent === "string" && finalContent.trim()) {
			// Strip HTML tags and calculate word count
			const strippedContent = finalContent
				.replace(/<[^>]*>/g, " ")
				.replace(/\s+/g, " ")
				.trim();
			wordCount = strippedContent
				? strippedContent.split(/\s+/).filter((w) => w.length > 0).length
				: 0;
		} else if (typeof finalContent === "object" && finalContent !== null) {
			// Handle TipTap JSON format
			try {
				const textContent = this.extractTextFromTipTap(finalContent);
				wordCount = textContent.split(/\s+/).filter((w) => w.length > 0).length;
			} catch (e) {
				console.error("[DEBUG publish] Error extracting text from JSON:", e);
			}
		}

		console.log("[DEBUG publish] wordCount:", wordCount);

		if (!finalTitle || wordCount === 0) {
			throw new BadRequestException(
				"Cannot publish an empty post without a title or content",
			);
		}

		// Always update title and content when publishing
		if (finalTitle !== post.title) {
			post.title = finalTitle;
			console.log("[DEBUG publish] Updated title to:", finalTitle);
		}

		// Update content with proper string handling
		if (finalContent !== post.content) {
			const contentString =
				typeof finalContent === "string"
					? finalContent
					: JSON.stringify(finalContent);
			post.content = contentString;
			post.wordCount = wordCount;
			console.log(
				"[DEBUG publish] Updated content to:",
				contentString.substring(0, 100),
			);
		}

		post.status = "published";
		post.publishedAt = new Date();

		console.log("[DEBUG publish] Saving post with status: published");
		const savedPost = await post.save();
		console.log(
			"[DEBUG publish] Post saved successfully. Title:",
			savedPost.title,
		);

		return savedPost;
	}

	// Helper method to extract text from TipTap JSON format
	private extractTextFromTipTap(content: Record<string, unknown>): string {
		if (!content || !content.content) return "";

		const textContent: string[] = [];
		const extractText = (nodes: unknown[]) => {
			nodes.forEach((node) => {
				if (typeof node === "object" && node !== null) {
					const n = node as {
						type?: string;
						text?: string;
						content?: unknown[];
					};
					if (n.type === "text" && n.text) {
						textContent.push(n.text);
					}
					if (n.content && Array.isArray(n.content)) {
						extractText(n.content);
					}
				}
			});
		};

		if (Array.isArray(content.content)) {
			extractText(content.content);
		}

		return textContent.join(" ");
	}

	async updateDraft(
		tenantId: string,
		userId: string,
		postId: string,
		data: UpdateDraftData,
	) {
		if (!data) {
			throw new BadRequestException("No data provided for update");
		}

		const updatePayload: UpdateDraftData = { ...data };

		// Safe stringify with null check - always returns a string
		const getDebugString = (obj: unknown): string => {
			if (obj === null || obj === undefined) {
				return "undefined";
			}
			return String(obj).substring(0, 200);
		};

		console.log("[DEBUG updateDraft] received data:", getDebugString(data));

		if (data.content) {
			const contentString =
				typeof data.content === "string"
					? data.content
					: JSON.stringify(data.content);
			updatePayload.content = contentString;

			const { words, minutes } = calculateReadingTime(contentString);
			updatePayload.wordCount = words;
			updatePayload.readingTime = minutes;
			console.log(
				"[DEBUG updateDraft] calculated wordCount:",
				words,
				"minutes:",
				minutes,
			);
		}

		if (data.image) {
			updatePayload.coverImage = data.image;
			delete updatePayload.image;
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

		console.log(
			"[DEBUG updateDraft] saved post.wordCount:",
			updatedPost.wordCount,
		);

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
			coverImage: dto.image,
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

		// Add image alias for frontend compatibility
		const postsWithImage = posts.map((post) => ({
			...(post.toObject() as unknown as Post),
			image: post.coverImage,
		}));

		const total = await this.postModel
			.countDocuments({ status: "published" })
			.exec();

		return {
			posts: postsWithImage,
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

		// Add image alias for frontend compatibility
		const postsWithImage = posts.map((post) => ({
			...(post.toObject() as unknown as Post),
			image: post.coverImage,
		}));

		const total = await this.postModel
			.countDocuments({ tenantId: tenantObjectId, status: "published" })
			.exec();

		return {
			posts: postsWithImage,
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
		const tenantObjectId = new Types.ObjectId(tenantId);
		const userObjectId = new Types.ObjectId(userId);

		const posts = await this.postModel
			.find({ tenantId: tenantObjectId, authorId: userObjectId })
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
						...(post.toObject() as unknown as Post),
						image: post.coverImage,
						viewCount: post.viewCount || 0,
						likeCount,
						commentCount,
					};
				} catch (error) {
					console.error(`Error getting counts for post ${post._id}:`, error);
					return {
						...(post.toObject() as unknown as Post),
						image: post.coverImage,
						viewCount: post.viewCount || 0,
						likeCount: 0,
						commentCount: 0,
					};
				}
			}),
		);

		const total = await this.postModel
			.countDocuments({ tenantId: tenantObjectId, authorId: userObjectId })
			.exec();

		return {
			posts: postsWithCounts,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getUserArchived(
		tenantId: string,
		userId: string,
		page: number = 1,
		limit: number = 10,
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
						...(post.toObject() as unknown as Post),
						image: post.coverImage,
						viewCount: post.viewCount || 0,
						likeCount,
						commentCount,
					};
				} catch (error) {
					console.error(`Error getting counts for post ${post._id}:`, error);
					return {
						...(post.toObject() as unknown as Post),
						image: post.coverImage,
						viewCount: post.viewCount || 0,
						likeCount: 0,
						commentCount: 0,
					};
				}
			}),
		);

		const total = await this.postModel
			.countDocuments({
				tenantId: tenantObjectId,
				authorId: userObjectId,
				status: "archived",
			})
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
		console.log("[PostsService] getPostById called with id:", id);
		const post = await this.postModel
			.findById(id)
			.populate("authorId", "name email avatar")
			.exec();

		console.log("[PostsService] post found:", post ? "yes" : "no");

		if (!post) {
			console.log("[PostsService] Throwing NotFoundException for id:", id);
			throw new NotFoundException("Post not found");
		}

		return {
			...(post.toObject() as unknown as Post),
			image: post.coverImage,
		};
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

		return {
			...(post.toObject() as unknown as Post),
			image: post.coverImage,
		};
	}

	async incrementView(postIdOrSlug: string): Promise<PostDocument> {
		// Check if it's a valid ObjectId, otherwise treat as slug
		const isValidObjectId = Types.ObjectId.isValid(postIdOrSlug);

		let post: PostDocument | null;

		if (isValidObjectId && postIdOrSlug.length === 24) {
			// It's likely an ObjectId
			post = await this.postModel.findByIdAndUpdate(
				postIdOrSlug,
				{ $inc: { viewCount: 1 } },
				{ new: true },
			);
		} else {
			// Treat as slug
			post = await this.postModel.findOneAndUpdate(
				{ slug: postIdOrSlug },
				{ $inc: { viewCount: 1 } },
				{ new: true },
			);
		}

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
}
