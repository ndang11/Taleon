import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Request,
} from "@nestjs/common";
import type { CommentsService } from "./comments.service";
import type { CreateCommentDto } from "./dto/create-comment.dto";

interface CustomRequest extends Request {
	user: { userId: string; tenantId: string };
	tenantId: string;
}

@Controller("comments")
export class CommentsController {
	constructor(private commentsService: CommentsService) {}

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
