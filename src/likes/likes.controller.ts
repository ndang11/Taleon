import {
	Controller,
	forwardRef,
	Get,
	Inject,
	NotFoundException,
	Param,
	Post,
	Req,
} from "@nestjs/common";
import type { Request } from "express";
import { PostsService } from "../posts/posts.service";
import { LikesService } from "./likes.service";

@Controller("likes")
export class LikesController {
	constructor(
		private likesService: LikesService,
		@Inject(forwardRef(() => PostsService))
		private postsService: PostsService,
	) {}

	@Post("post/:postId/toggle")
	async toggleLike(
		@Param("postId") postId: string,
		@Req() req: Request & {
			user: { tenantId: string; userId: string; sub: string };
		},
	) {
		const userId = req.user.userId;
		const tenantId = req.user.tenantId;

		const post = await this.postsService.getPostById(postId);
		if (!post) {
			throw new NotFoundException("Post not found");
		}

		return await this.likesService.toggleLike(postId, userId, tenantId);
	}

	@Get("post/:postId/status")
	async hasUserLiked(
		@Param("postId") postId: string,
		@Req() req: Request & {
			user: { tenantId: string; userId: string; sub: string };
		},
	) {
		const userId = req.user.userId;
		const tenantId = req.user.tenantId;
		return this.likesService.hasUserLiked(postId, userId, tenantId);
	}

	@Get("post/:postId/count")
	async getLikeCount(@Param("postId") postId: string) {
		return this.likesService.getLikeCount(postId);
	}
}
