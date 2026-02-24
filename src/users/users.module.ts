import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "../models/comment.model";
import { Like, LikeSchema } from "../models/like.model";
import { Follow, FollowSchema } from "../schemas/follow.schema";
import { Post, PostSchema } from "../schemas/post.schema";
import { User, UserSchema } from "../schemas/users.schema";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Follow.name, schema: FollowSchema },
			{ name: Post.name, schema: PostSchema },
			{ name: Like.name, schema: LikeSchema },
			{ name: Comment.name, schema: CommentSchema },
		]),
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
