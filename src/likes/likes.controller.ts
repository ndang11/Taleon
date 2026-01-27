import {
	Controller,
	Get,
	Param,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import type { Request as ExpressRequest } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../multi-tenant/tenant.guard";
import type { TenantContextService } from "../multi-tenant/tenant-context.service";
import type { LikesService } from "./likes.service";

interface CustomRequest extends ExpressRequest {
	user: { userId: string; tenantId: string };
	tenantId: string;
}

@Controller("likes")
@UseGuards(JwtAuthGuard, TenantGuard)
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

