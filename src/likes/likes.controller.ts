import { Controller, Get, Param, Post } from "@nestjs/common";
import type { TenantContextService } from "src/multi-tenant/tenant-context.service";
import type { LikesService } from "./likes.service";

@Controller("likes")
export class LikesController {
	constructor(
		private readonly likesService: LikesService,
		private readonly tenantContext: TenantContextService,
	) {}

	@Post("post/:postId/toggle")
	toggleLike(@Param("postId") postId: string) {
		return this.likesService.toggleLike(
			postId,
			this.tenantContext.requiredUserId,
			this.tenantContext.requiredTenantId,
		);
	}

	@Get("post/:postId/count")
	getLikeCount(@Param("postId") postId: string) {
		return this.likesService.getLikeCount(
			postId,
			this.tenantContext.requiredTenantId,
		);
	}

	@Get("post/:postId/status")
	hasUserLiked(@Param("postId") postId: string) {
		return this.likesService.hasUserLiked(
			postId,
			this.tenantContext.requiredUserId,
			this.tenantContext.requiredTenantId,
		);
	}
}
