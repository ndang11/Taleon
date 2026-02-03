import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { TenantGuard } from "../multi-tenant/tenant.guard";
import { FollowsService } from "./follows.service";

interface CustomRequest extends Request {
  user: { userId: string; tenantId: string };
  tenantId: string;
}

@Controller("follows")
@UseGuards(JwtAuthGuard, TenantGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(":userId")
  async follow(
    @Param("userId") userId: string,
    @Request() req: CustomRequest,
  ) {
    return this.followsService.follow(
      req.user.userId,
      userId,
      req.tenantId,
    );
  }

  @Delete(":userId")
  async unfollow(
    @Param("userId") userId: string,
    @Request() req: CustomRequest,
  ) {
    return this.followsService.unfollow(req.user.userId, userId);
  }

  @Get(":userId/status")
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

  @Get(":userId/followers")
  async getFollowers(@Param("userId") userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get(":userId/following")
  async getFollowing(@Param("userId") userId: string) {
    return this.followsService.getFollowing(userId);
  }

  @Get(":userId/counts")
  async getCounts(@Param("userId") userId: string) {
    const followersCount = await this.followsService.getFollowersCount(userId);
    const followingCount = await this.followsService.getFollowingCount(userId);
    return { followersCount, followingCount };
  }
}
