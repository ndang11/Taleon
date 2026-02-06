import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { PostsService } from "./posts.service";

// Type alias for the authenticated user
interface AuthenticatedUser {
	userId: string;
	email: string;
	tenantId: string;
}

@Controller("posts")
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Public()
	@Get()
	async getPublishedPosts(
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		return this.postsService.getPublishedPosts(Number(page), Number(limit));
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("user")
	async getUserPosts(
		@CurrentUser() user: AuthenticatedUser,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
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
		@CurrentUser() user: AuthenticatedUser,
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		return this.postsService.getTenantPublishedPosts(
			user.tenantId,
			Number(page),
			Number(limit),
		);
	}
}
