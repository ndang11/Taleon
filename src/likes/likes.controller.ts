import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { ToggleLikeDto } from "./dto/toggle-like.dto";
import { LikesService } from "./likes.service";

// Type alias for the authenticated user
interface AuthenticatedUser {
	userId: string;
	email: string;
	tenantId: string;
}

@Controller("likes")
export class LikesController {
	constructor(private readonly likesService: LikesService) {}

	@UseGuards(AuthGuard("jwt"))
	@Post("post/:postId/toggle")
	async toggleLike(
		@CurrentUser() user: AuthenticatedUser,
		@Param("postId") postId: string,
	) {
		return this.likesService.toggleLike(
			postId,
			user.userId,
			user.tenantId,
		);
	}

	@Public()
	@Get("post/:postId/count")
	async getLikeCount(
		@Param("postId") postId: string,
		@Req() req: any,
	) {
		const tenantId = req.query.tenantId as string | undefined;
		const count = await this.likesService.getLikeCount(postId, tenantId);
		return { likeCount: count };
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("post/:postId/status")
	async getLikeStatus(
		@CurrentUser() user: AuthenticatedUser,
		@Param("postId") postId: string,
	) {
		const [liked, likeCount] = await Promise.all([
			this.likesService.hasUserLiked(postId, user.userId, user.tenantId),
			this.likesService.getLikeCount(postId, user.tenantId),
		]);
		return { liked, likeCount };
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("post/:postId/check")
	async hasUserLiked(
		@CurrentUser() user: AuthenticatedUser,
		@Param("postId") postId: string,
	) {
		const liked = await this.likesService.hasUserLiked(
			postId,
			user.userId,
			user.tenantId,
		);
		return { liked };
	}
}
