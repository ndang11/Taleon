import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import type { TenantService } from "../multi-tenant/tenant.service";
import { POST_MODEL, type Post } from "./post.schema";

@Injectable()
export class PostsService {
	constructor(
		@InjectModel(POST_MODEL) private postModel: Model<Post>,
		private tenantService: TenantService,
	) {}

	async create(createPostDto: {
		title: string;
		content: string;
	}): Promise<Post> {
		return this.tenantService.create(this.postModel, createPostDto);
	}

	async findAll(): Promise<Post[]> {
		return this.tenantService.find(this.postModel);
	}

	async findOne(id: string): Promise<Post | null> {
		return this.tenantService.findOne(this.postModel, { _id: id });
	}

	async update(
		id: string,
		updatePostDto: Partial<{ title: string; content: string }>,
	): Promise<any> {
		return this.tenantService.updateOne(
			this.postModel,
			{ _id: id },
			updatePostDto,
		);
	}

	async remove(id: string): Promise<any> {
		return this.tenantService.deleteOne(this.postModel, { _id: id });
	}
}
