import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import type { JwtUser } from "../auth/interfaces/jwt-user.interface";
import type { CloudinaryService } from "../cloudinary/cloudinary.service";
import { generateSlug } from "../common/utils/slug.util";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdatePostDto } from "./dto/update-post.dto";
import { Post } from "./schemas/post.schema";

@Injectable()
export class PostsService {
	constructor(
		@InjectModel(Post.name)
		private readonly postModel: Model<Post>,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	/** CREATE POST */
	async create(dto: CreatePostDto, user: JwtUser, image?: any) {
		if (!user || !user.tenantId) {
			throw new BadRequestException("Invalid authenticated user");
		}

		// Upload image if provided
		let uploadedImageUrl: string | undefined;
		if (image) {
			try {
				uploadedImageUrl = await this.cloudinaryService.uploadImage(image);
			} catch (_error) {
				throw new BadRequestException("Failed to upload image");
			}
		}

		try {
			const post = await this.postModel.create({
				...dto,
				slug: generateSlug(dto.title),
				tenantId: user.tenantId,
				authorId: user.userId,
				...(uploadedImageUrl && { imageUrl: uploadedImageUrl }),
			});

			return post;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				error.code === 11000
			) {
				throw new BadRequestException("A post with this title already exists");
			}
			if (
				error &&
				typeof error === "object" &&
				"name" in error &&
				error.name === "ValidationError" &&
				"message" in error
			) {
				throw new BadRequestException(`Validation failed: ${error.message}`);
			}
			throw new BadRequestException("Failed to create post");
		}
	}

	/** GET ALL POSTS FOR TENANT */
	async findAllByTenant(tenantId: string) {
		return this.postModel.find({ tenantId }).sort({ createdAt: -1 });
	}

	/** GET SINGLE POST */
	async findOne(id: string, tenantId: string) {
		const post = await this.postModel
			.findOne({ _id: id, tenantId })
			.populate("authorId", "name");

		if (!post) throw new NotFoundException("Post not found");
		return post;
	}

	/** UPDATE POST */
	async update(
		id: string,
		dto: UpdatePostDto,
		tenantId: string,
		userId: string,
		file?: any,
	) {
		const post = await this.findOne(id, tenantId);

		// Only author can edit
		if (post.authorId.toString() !== userId) {
			throw new ForbiddenException("You cannot edit this post");
		}

		Object.assign(post, dto);

		// Update slug if title changed
		if (dto.title) {
			post.slug = generateSlug(dto.title);
		}

		// Update image if new file provided
		if (file) {
			try {
				const uploadedImageUrl = await this.cloudinaryService.uploadImage(file);
				post.imageUrl = uploadedImageUrl;
			} catch (_error) {
				throw new BadRequestException("Failed to upload image");
			}
		}

		return post.save();
	}

	/** DELETE POST */
	async remove(id: string, tenantId: string, userId: string) {
		const post = await this.findOne(id, tenantId);

		// Only author can delete
		if (post.authorId.toString() !== userId) {
			throw new ForbiddenException("You cannot delete this post");
		}

		await post.deleteOne();
		return { message: "Post deleted successfully" };
	}
}
