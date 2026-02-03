import {
	Controller,
	forwardRef,
	Get,
	Inject,
	NotFoundException,
	Param,
	Post,
	UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { TenantContextService } from "src/multi-tenant/tenant-context.service";
import { LikesService } from "./likes.service";
import { PostsService } from "../posts/posts.service";
import { Public } from "../common/decorators/public.decorator";

@Controller("likes")
export class LikesController {
	constructor(
		private readonly likesService: LikesService,
		private readonly tenantContext: TenantContextService,
		@Inject(forwardRef(() => PostsService))
		private readonly postsService: PostsService,
	) {}

	@Post("post/:postId/toggle")
	@UseGuards(JwtAuthGuard)
	async toggleLike(@Param("postId") postId: string) {
		const userId = this.tenantContext.requiredUserId;

		const post = await this.postsService.getPostById(postId);
		if (!post) {
			throw new NotFoundException("Post not found");
		}

		const tenantId = post.tenantId.toString();

		return await this.likesService.toggleLike(postId, userId, tenantId);
	}

	@Get("post/:postId/count")
	@Public()
	async getLikeCount(@Param("postId") postId: string) {
		return await this.likesService.getLikeCount(postId);
	}

	@Get("post/:postId/status")
	@UseGuards(JwtAuthGuard)
	async hasUserLiked(@Param("postId") postId: string) {
		const userId = this.tenantContext.requiredUserId;

		const post = await this.postsService.getPostById(postId);
		if (!post) {
			throw new NotFoundException("Post not found");
		}

		const tenantId = post.tenantId.toString();

		return await this.likesService.hasUserLiked(postId, userId, tenantId);
	}
}
