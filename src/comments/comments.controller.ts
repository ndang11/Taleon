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
import { AuthGuard } from "@nestjs/passport";
import type { NotificationsService } from "../notifications/notifications.service";
import type { PostsService } from "../posts/posts.service";
import type { CommentsService } from "./comments.service";
import type { CreateCommentDto } from "./dto/create-comment.dto";

interface CustomRequest extends Request {
	user: { userId: string; tenantId: string };
	tenantId: string;
}

@Controller("comments")
export class CommentsController {
	constructor(
		private commentsService: CommentsService,
		private notificationsService: NotificationsService,
		private postsService: PostsService,
	) {}

	@UseGuards(AuthGuard("jwt"))
	@Post()
	async create(
		@Body() createCommentDto: CreateCommentDto,
		@Request() req: CustomRequest,
	) {
		// Use raw body if DTO is empty due to ValidationPipe issues
		const data =
			createCommentDto && Object.keys(createCommentDto).length > 0
				? createCommentDto
				: (req.body as any);

		console.log("[Comments Controller] DTO:", createCommentDto);
		console.log("[Comments Controller] Final data:", data);

		const comment = await this.commentsService.create(
			data,
			req.user.userId,
			req.user.tenantId,
		);

		// Create notification for the post author
		try {
			const post = await this.postsService.getPostById(data.postId);
			if (post?.authorId && (post.authorId as any)._id !== req.user.userId) {
				await this.notificationsService.create({
					userId: (post.authorId as any)._id,
					fromUserId: req.user.userId,
					type: "comment" as any,
					postId: data.postId,
					message: "Someone commented on your post",
					link: `/post/${data.postId}`,
				});
			}
		} catch (e) {
			console.error("Failed to create comment notification:", e);
		}

		return comment;
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("post/:postId")
	findByPost(@Param("postId") postId: string, @Request() req: CustomRequest) {
		return this.commentsService.findByPost(postId, req.user.tenantId);
	}

	@UseGuards(AuthGuard("jwt"))
	@Delete(":id")
	remove(@Param("id") id: string, @Request() req: CustomRequest) {
		return this.commentsService.remove(id, req.user.userId, req.user.tenantId);
	}
}
