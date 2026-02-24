import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "../models/comment.model";
import { NotificationsModule } from "../notifications/notifications.module";
import { PostsModule } from "../posts/posts.module";
import { UsersModule } from "../users/users.module";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
		NotificationsModule,
		forwardRef(() => PostsModule),
		UsersModule,
	],
	controllers: [CommentsController],
	providers: [CommentsService],
	exports: [CommentsService],
})
export class CommentsModule {}
