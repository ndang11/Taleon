import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { NotificationType } from "../notifications/notifications.schema";
import { NotificationsService } from "../notifications/notifications.service";
import { PostsService } from "../posts/posts.service";
import { LikesService } from "./likes.service";

interface PopulatedAuthor {
	_id: { toString(): string };
	name?: string;
	email?: string;
	avatar?: string;
}

interface AuthenticatedUser {
	userId: string;
	email: string;
	tenantId: string;
}

@Controller("likes")
export class LikesController {
	constructor(
		private readonly likesService: LikesService,
		private readonly notificationsService: NotificationsService,
		private readonly postsService: PostsService,
	) {}

	@UseGuards(AuthGuard("jwt"))
	@Post("post/:postId/toggle")
	async toggleLike(
		@CurrentUser() user: AuthenticatedUser,
		@Param("postId") postId: string,
	) {
		const result = await this.likesService.toggleLike(
			postId,
			user.userId,
			user.tenantId,
		);

		if (result.liked) {
			try {
				const post = await this.postsService.getPostById(postId);
				const author = post.authorId as unknown as PopulatedAuthor | null;
				const authorId = author?._id?.toString();
				if (authorId && authorId !== user.userId) {
					await this.notificationsService.create({
						userId: authorId,
						fromUserId: user.userId,
						type: NotificationType.LIKE,
						postId,
						message: "Someone liked your post",
						link: `/post/${postId}`,
					});
				}
			} catch (e) {
				console.error("Failed to create like notification:", e);
			}
		}

		return result;
	}

	@Public()
	@Get("post/:postId/count")
	async getLikeCount(@Param("postId") postId: string, @Req() req: Request) {
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
