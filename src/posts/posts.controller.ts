import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UpdateDraftDto } from "./dto/update-post.dto";
import { CreatePostDto } from "./dto/create-post.dto";
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

	@UseGuards(AuthGuard("jwt"))
	@Post()
	async createPost(
		@CurrentUser() user: AuthenticatedUser,
		@Body() dto: CreatePostDto,
	) {
		return this.postsService.initializeDraft(
			user.tenantId,
			user.userId,
			dto,
		);
	}

	@UseGuards(AuthGuard("jwt"))
	@Patch(":id")
	async updatePost(
		@CurrentUser() user: AuthenticatedUser,
		@Param("id") id: string,
		@Body() dto: UpdateDraftDto,
	) {
		return this.postsService.updateDraft(
			user.tenantId,
			user.userId,
			id,
			dto,
		);
	}

	@UseGuards(AuthGuard("jwt"))
	@Delete(":id")
	async deletePost(
		@CurrentUser() user: AuthenticatedUser,
		@Param("id") id: string,
	) {
		return this.postsService.delete(
			user.tenantId,
			user.userId,
			id,
		);
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
