import {
	Controller,
	Get,
	Param,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../multi-tenant/tenant.guard";
import type { LikesService } from "./likes.service";

interface CustomRequest extends Request {
	user: { userId: string; tenantId: string };
	tenantId: string;
}

@Controller("likes")
export class LikesController {
	constructor(private readonly likesService: LikesService) {}

	@Post("post/:postId/toggle")
	toggleLike(@Param("postId") postId: string, @Request() req: CustomRequest) {
		return this.likesService.toggleLike(postId, req.user.userId, req.tenantId);
	}

	@Get("post/:postId/count")
	getLikeCount(@Param("postId") postId: string, @Request() req: CustomRequest) {
		return this.likesService.getLikeCount(postId, req.tenantId);
	}

	@Get("post/:postId/status")
	hasUserLiked(@Param("postId") postId: string, @Request() req: CustomRequest) {
		return this.likesService.hasUserLiked(
			postId,
			req.user.userId,
			req.tenantId,
		);
	}
}

