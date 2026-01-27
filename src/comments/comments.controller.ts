import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../multi-tenant/tenant.guard";
import type { CommentsService } from "./comments.service";
import type { CreateCommentDto } from "./dto/create-comment.dto";

interface CustomRequest extends Request {
	user: { userId: string; tenantId: string };
	tenantId: string;
}

@Controller("comments")
@UseGuards(JwtAuthGuard, TenantGuard)
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Post()
	create(
		@Body() createCommentDto: CreateCommentDto,
		@Request() req: CustomRequest,
	) {
		return this.commentsService.create(
			createCommentDto,
			req.user.userId,
			req.tenantId,
		);
	}

	@Get("post/:postId")
	findByPost(@Param("postId") postId: string, @Request() req: CustomRequest) {
		return this.commentsService.findByPost(postId, req.tenantId);
	}

	@Delete(":id")
	remove(@Param("id") id: string, @Request() req: CustomRequest) {
		return this.commentsService.remove(id, req.user.userId, req.tenantId);
	}
}
