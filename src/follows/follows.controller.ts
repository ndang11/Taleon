import {
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import { TenantGuard } from "../multi-tenant/tenant.guard";
import type { FollowsService } from "./follows.service";

interface CustomRequest extends Request {
	user: { userId: string; tenantId: string };
	tenantId: string;
}

@Controller("follows")
@UseGuards(TenantGuard)
export class FollowsController {
	constructor(private followsService: FollowsService) {}

	@Post(":userId")
	async follow(@Param("userId") userId: string, @Request() req: CustomRequest) {
		return this.followsService.follow(req.user.userId, userId, req.tenantId);
	}

	@Delete(":userId")
	async unfollow(
		@Param("userId") userId: string,
		@Request() req: CustomRequest,
	) {
		return this.followsService.unfollow(req.user.userId, userId);
	}

	@Get("followers/:userId")
	async getFollowers(@Param("userId") userId: string) {
		return this.followsService.getFollowers(userId);
	}

	@Get("following/:userId")
	async getFollowing(@Param("userId") userId: string) {
		return this.followsService.getFollowing(userId);
	}

	@Get("check/:userId")
	async isFollowing(
		@Param("userId") userId: string,
		@Request() req: CustomRequest,
	) {
		return this.followsService.isFollowing(req.user.userId, userId);
	}
}
