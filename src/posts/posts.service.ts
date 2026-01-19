import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, Types } from "mongoose";
import { generateSlug } from "../common/utils/slug.util";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdatePostDto } from "./dto/update-post.dto";
import { Post } from "./schemas/post.schema";
@Injectable()
export class PostsService {
	constructor(
		@InjectModel(Post.name)
		private readonly postModel: Model<Post>,
	) {}

	async create(
		dto: CreatePostDto,
		tenantId: Types.ObjectId,
		authorId: Types.ObjectId,
	) {
		const post = await this.postModel.create({
			...dto,
			slug: generateSlug(dto.title),
			tenantId,
			authorId,
		});

		return post;
	}

	async findAllByTenant(tenantId: Types.ObjectId) {
		return this.postModel.find({ tenantId }).sort({ createdAt: -1 });
	}

	async findOne(id: string, tenantId: Types.ObjectId) {
		const post = await this.postModel.findOne({
			_id: id,
			tenantId,
		});

		if (!post) throw new NotFoundException("Post not found");
		return post;
	}

	async update(
		id: string,
		dto: UpdatePostDto,
		tenantId: Types.ObjectId,
		userId: Types.ObjectId,
	) {
		const post = await this.findOne(id, tenantId);

		if (!post.authorId.equals(userId)) {
			throw new ForbiddenException("You cannot edit this post");
		}

		Object.assign(post, dto);

		if (dto.title) {
			post.slug = generateSlug(dto.title);
		}

		return post.save();
	}

	async remove(id: string, tenantId: Types.ObjectId, userId: Types.ObjectId) {
		const post = await this.findOne(id, tenantId);

		if (!post.authorId.equals(userId)) {
			throw new ForbiddenException("You cannot delete this post");
		}

		await post.deleteOne();
		return { message: "Post deleted successfully" };
	}
}
