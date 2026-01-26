import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { LikesService } from "./likes.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../multi-tenant/tenant.guard";

interface CustomRequest extends Request {
  user: { id: string; tenantId: string };
  tenantId: string;
}

@Controller("likes")
@UseGuards(JwtAuthGuard, TenantGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post("post/:postId/toggle")
  toggleLike(@Param("postId") postId: string, @Request() req: CustomRequest) {
    return this.likesService.toggleLike(postId, req.user.id, req.tenantId);
  }

  @Get("post/:postId/count")
  getLikeCount(@Param("postId") postId: string, @Request() req: CustomRequest) {
    return this.likesService.getLikeCount(postId, req.tenantId);
  }

  @Get("post/:postId/status")
  hasUserLiked(@Param("postId") postId: string, @Request() req: CustomRequest) {
    return this.likesService.hasUserLiked(postId, req.user.id, req.tenantId);
  }
}