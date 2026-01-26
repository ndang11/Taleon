import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../multi-tenant/tenant.guard";

interface CustomRequest extends Request {
  user: { id: string; tenantId: string };
  tenantId: string;
}

@Controller("comments")
@UseGuards(JwtAuthGuard, TenantGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req: CustomRequest) {
    return this.commentsService.create(createCommentDto, req.user.id, req.tenantId);
  }

  @Get("post/:postId")
  findByPost(@Param("postId") postId: string, @Request() req: CustomRequest) {
    return this.commentsService.findByPost(postId, req.tenantId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req: CustomRequest) {
    return this.commentsService.remove(id, req.user.id, req.tenantId);
  }
}