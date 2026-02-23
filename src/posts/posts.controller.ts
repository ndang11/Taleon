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
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import type { AutosavePostDto } from "./dto/autosave-post.dto";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdateDraftDto } from "./dto/update-post.dto";
import { PostsService } from "./posts.service";

interface AuthenticatedUser {
	userId: string;
	email: string;
	tenantId: string;
}

@Controller("posts")
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@UseGuards(AuthGuard("jwt"))
	@Post()
	async createPost(
		@CurrentUser() user: AuthenticatedUser,
		@Body() dto: CreatePostDto,
	) {
		return this.postsService.initializeDraft(user.tenantId, user.userId, dto);
	}

	@UseGuards(AuthGuard("jwt"))
	@Patch(":id/autosave")
	autoSave(
		@CurrentUser() user: AuthenticatedUser,
		@Param("id") id: string,
		@Body() dto: AutosavePostDto,
		@Req() req: Request,
	) {
		console.log(
			"[autoSave Controller] Raw body:",
			req.body ? JSON.stringify(req.body).substring(0, 200) : "(undefined)",
		);
		console.log("[autoSave Controller] DTO received:", JSON.stringify(dto));
		console.log("[autoSave Controller] DTO keys:", Object.keys(dto || {}));
		// Use raw body if DTO is empty due to ValidationPipe issues
		const data = dto && Object.keys(dto).length > 0 ? dto : req.body;
		console.log(
			"[autoSave Controller] Using data:",
			JSON.stringify(data).substring(0, 200),
		);
		return this.postsService.updateDraft(user.tenantId, user.userId, id, data);
	}

	@UseGuards(AuthGuard("jwt"))
	@Patch(":id")
	async updatePost(
		@CurrentUser() user: AuthenticatedUser,
		@Param("id") id: string,
		@Body() dto: UpdateDraftDto,
	) {
		return this.postsService.updateDraft(user.tenantId, user.userId, id, dto);
	}

	@UseGuards(AuthGuard("jwt"))
	@Delete(":id")
	async deletePost(
		@CurrentUser() user: AuthenticatedUser,
		@Param("id") id: string,
	) {
		return this.postsService.delete(user.tenantId, user.userId, id);
	}

	@Public()
	@Get()
	async getPublishedPosts(
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		return this.postsService.getPublishedPosts(Number(page), Number(limit));
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("slug/:slug")
	async getUserPostBySlug(@Req() req: Request, @Param("slug") slug: string) {
		const user = req.user as AuthenticatedUser;

		if (!user || !user.userId || !user.tenantId) {
			throw new Error("User not authenticated properly");
		}

		const post = await this.postsService.getUserPostBySlug(
			user.tenantId,
			user.userId,
			slug,
		);

		if (!post) {
			throw new Error("Post not found");
		}

		return { post };
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("user")
	async getUserPosts(
		@Req() req: Request,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		const user = req.user as AuthenticatedUser;

		if (!user || !user.userId || !user.tenantId) {
			throw new Error("User not authenticated properly");
		}

		return this.postsService.getUserPosts(
			user.tenantId,
			user.userId,
			Number(page),
			Number(limit),
		);
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("tenant-published")
	async getTenantPublishedPosts(
		@Req() req: Request,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		const user = req.user as AuthenticatedUser;

		if (!user || !user.tenantId) {
			throw new Error("User not authenticated properly");
		}

		return this.postsService.getTenantPublishedPosts(
			user.tenantId,
			Number(page),
			Number(limit),
		);
	}

	@Public()
	@Get("slug/public/:slug")
	async getPublishedPostBySlug(@Param("slug") slug: string) {
		return this.postsService.getPublishedPostBySlug(slug);
	}

	@Public()
	@Get("search")
	async searchPosts(
		@Query("q") query: string,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		if (!query || query.trim().length === 0) {
			return { posts: [], total: 0, page: 1, limit: 10, totalPages: 0 };
		}
		return this.postsService.searchPosts(
			query.trim(),
			Number(page),
			Number(limit),
		);
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("tenant-all")
	async getAllTenantPosts(
		@Req() req: Request,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		const user = req.user as AuthenticatedUser;

		if (!user || !user.tenantId) {
			throw new Error("User not authenticated properly");
		}

		return this.postsService.getAllTenantPosts(
			user.tenantId,
			Number(page),
			Number(limit),
		);
	}

	@Public()
	@Get(":id")
	async getPostById(@Param("id") id: string) {
		return this.postsService.getPostById(id);
	}

	@Public()
	@Post(":id/view")
	async incrementView(@Param("id") id: string) {
		return this.postsService.incrementView(id);
	}

	@UseGuards(AuthGuard("jwt"))
	@Patch(":id/publish")
	async publishPost(
		@CurrentUser() user: AuthenticatedUser,
		@Param("id") id: string,
		@Body() dto: UpdateDraftDto,
		@Req() req: Request,
	) {
		const data = dto && Object.keys(dto).length > 0 ? dto : req.body;
		console.log(
			"[publishPost] Using data:",
			JSON.stringify(data).substring(0, 200),
		);
		return this.postsService.publish(user.tenantId, user.userId, id, data);
	}

	@UseGuards(AuthGuard("jwt"))
	@Patch(":id/archive")
	async archivePost(
		@CurrentUser() user: AuthenticatedUser,
		@Param("id") id: string,
		@Body() dto: UpdateDraftDto,
	) {
		return this.postsService.archivePost(user.tenantId, user.userId, id, dto);
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("user/archived")
	async getUserArchivedPosts(
		@CurrentUser() user: AuthenticatedUser,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		return this.postsService.getUserArchived(
			user.tenantId,
			user.userId,
			Number(page),
			Number(limit),
		);
	}
}
