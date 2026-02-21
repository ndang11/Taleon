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
import { NotificationsService } from "../notifications/notifications.service";
import { FollowsService } from "./follows.service";

interface CustomRequest extends Request {
	user: { userId: string; tenantId: string };
	tenantId: string;
}

@Controller("follows")
@UseGuards(TenantGuard)
export class FollowsController {
	constructor(
		private followsService: FollowsService,
		private notificationsService: NotificationsService,
	) {}

	@Post(":userId")
	async follow(@Param("userId") userId: string, @Request() req: CustomRequest) {
		const result = await this.followsService.follow(
			req.user.userId,
			userId,
			req.user.tenantId,
		);

		// Create notification for the followed user
		try {
			await this.notificationsService.create({
				userId: userId,
				fromUserId: req.user.userId,
				type: "follow" as any,
				message: "Someone followed you",
				link: `/profile/${req.user.userId}`,
			});
		} catch (e) {
			console.error("Failed to create follow notification:", e);
		}

		return result;
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
		const isFollowing = await this.followsService.isFollowing(
			req.user.userId,
			userId,
		);
		return { isFollowing };
	}
}
