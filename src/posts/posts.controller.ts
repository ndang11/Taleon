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
import type { Request } from "express";
import { Public } from "src/common/decorators/public.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import type { PostContent } from "src/interfaces/post.type";
import { TenantGuard } from "../common/guards/tenant.guard";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get()
	@Public()
	async getPublishedPosts(
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		return this.postsService.getPublishedPosts(
			parseInt(page, 10),
			parseInt(limit, 10),
		);
	}

	@Get("tenant-published")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async getTenantPublishedPosts(
		@Req() req: Request,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		return this.postsService.getTenantPublishedPosts(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			parseInt(page, 10),
			parseInt(limit, 10),
		);
	}

	@Get("tenant-all")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async getAllTenantPosts(
		@Req() req: Request,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "50",
	) {
		return this.postsService.getAllTenantPosts(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			parseInt(page, 10),
			parseInt(limit, 10),
		);
	}

	@Get("user")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async getUserPosts(
		@Req() req: Request,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		return this.postsService.getUserPosts(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			// @ts-expect-error - user is added by JWT strategy
			req.user.userId,
			parseInt(page, 10),
			parseInt(limit, 10),
		);
	}

	@Get("user/:userId/published")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async getPublishedPostsByAuthor(@Param("userId") userId: string) {
		return this.postsService.getPublishedPostsByAuthor(userId);
	}

	@Get(":id")
	@Public()
	async getPost(@Param("id") id: string) {
		const post = await this.postsService.getPostById(id);
		return { post };
	}

	@Post(":id/view")
	@Public()
	async incrementView(@Param("id") id: string) {
		const post = await this.postsService.incrementView(id);
		return { viewCount: post.viewCount };
	}

	@Get("slug/:slug")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async getUserPostBySlug(@Param("slug") slug: string, @Req() req: Request) {
		const post = await this.postsService.getUserPostBySlug(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			// @ts-expect-error - user is added by JWT strategy
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
	async create(@Req() req: Request, @Body() dto: CreatePostDto) {
		return this.postsService.initializeDraft(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			// @ts-expect-error - user is added by JWT strategy
			req.user.userId,
			dto,
		);
	}

	@Patch(":id/autosave")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async autoSave(
		@Param("id") id: string,
		@Req() req: Request,
		@Body() body: { content: PostContent; title?: string },
	) {
		return this.postsService.updateDraft(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			// @ts-expect-error - user is added by JWT strategy
			req.user.userId,
			id,
			body,
		);
	}

	@Patch(":id/publish")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async publish(@Param("id") id: string, @Req() req: Request) {
		return this.postsService.publish(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			// @ts-expect-error - user is added by JWT strategy
			req.user.userId,
			id,
		);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async delete(@Param("id") id: string, @Req() req: Request) {
		return this.postsService.delete(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			// @ts-expect-error - user is added by JWT strategy
			req.user.userId,
			id,
		);
	}

	/**
	 * Archive a post
	 * PATCH /posts/:id/archive
	 */
	@Patch(":id/archive")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async archive(
		@Param("id") id: string,
		@Req() req: Request,
		@Body() body: { content?: unknown; title?: string; image?: string },
	) {
		return this.postsService.archivePost(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			// @ts-expect-error - user is added by JWT strategy
			req.user.userId,
			id,
			body,
		);
	}

	/**
	 * Get user's draft posts
	 * GET /posts/user/drafts
	 */
	@Get("user/drafts")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async getUserDrafts(
		@Req() req: Request,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "20",
	) {
		return this.postsService.getUserDrafts(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			// @ts-expect-error - user is added by JWT strategy
			req.user.userId,
			parseInt(page, 10),
			parseInt(limit, 10),
		);
	}

	/**
	 * Get user's archived posts
	 * GET /posts/user/archived
	 */
	@Get("user/archived")
	@UseGuards(JwtAuthGuard, TenantGuard)
	async getUserArchived(
		@Req() req: Request,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "20",
	) {
		return this.postsService.getUserArchived(
			// @ts-expect-error - user is added by JWT strategy
			req.user.tenantId,
			// @ts-expect-error - user is added by JWT strategy
			req.user.userId,
			parseInt(page, 10),
			parseInt(limit, 10),
		);
	}
}
