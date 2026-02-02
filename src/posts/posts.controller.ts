import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { PostContent } from "src/interfaces/post.type";
import { TenantGuard } from "../common/guards/tenant.guard";
import { CreatePostDto } from "./dto/create-post.dto";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get()
	@Public()
	async getPublishedPosts(
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		return this.postsService.getPublishedPosts(parseInt(page, 10), parseInt(limit, 10));
	}

	@Get("tenant-published")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async getTenantPublishedPosts(
		@Req() req: any,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		return this.postsService.getTenantPublishedPosts(
			req.user.tenantId,
			parseInt(page, 10),
			parseInt(limit, 10),
		);
	}

	@Get("user")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async getUserPosts(
		@Req() req: any,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		return this.postsService.getUserPosts(
			req.user.tenantId,
			req.user.userId,
			parseInt(page, 10),
			parseInt(limit, 10),
		);
	}

	@Get(":id")
	@Public()
	async getPost(@Param("id") id: string) {
		const post = await this.postsService.getPostById(id);
		return { post };
	}

	@Get("slug/:slug")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async getUserPostBySlug(@Param("slug") slug: string, @Req() req: any) {
		const post = await this.postsService.getUserPostBySlug(
			req.user.tenantId,
			req.user.userId,
			slug,
		);
		return { post };
	}

	@Get("slug/:slug")
	@Public()
	async getPublishedPostBySlug(@Param("slug") slug: string) {
		const post = await this.postsService.getPublishedPostBySlug(slug);
		return { post };
	}

	@Post()
	@UseGuards(JwtAuthGuard, TenantGuard)
	async create(@Req() req: any, @Body() dto: CreatePostDto) {
		return this.postsService.initializeDraft(
			req.user.tenantId,
			req.user.userId,
			dto,
		);
	}

	@Patch(":id/autosave")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async autoSave(
		@Param("id") id: string,
		@Req() req: any,
		@Body() body: { content: PostContent; title?: string },
	) {
		return this.postsService.updateDraft(
			req.user.tenantId,
			req.user.userId,
			id,
			body,
		);
	}

	@Patch(":id/publish")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async publish(@Param("id") id: string, @Req() req: any) {
		return this.postsService.publish(req.user.tenantId, req.user.userId, id);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async delete(@Param("id") id: string, @Req() req: any) {
		return this.postsService.delete(req.user.tenantId, req.user.userId, id);
	}
}
