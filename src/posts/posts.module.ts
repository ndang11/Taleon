// src/posts/posts.module.ts
import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { CommentsModule } from "../comments/comments.module";
import { CommentsService } from "../comments/comments.service";
import { LikesModule } from "../likes/likes.module";
import { LikesService } from "../likes/likes.service";
import { Post, PostSchema } from "../schemas/post.schema";
import { TenantsModule } from "../tenants/tenants.module";
import { COMMENTS_SERVICE, LIKES_SERVICE } from "./posts.constants";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
		AuthModule,
		TenantsModule,
		CommentsModule,
		forwardRef(() => LikesModule),
	],
	controllers: [PostsController],
	providers: [
		PostsService,
		{
			provide: COMMENTS_SERVICE,
			useExisting: CommentsService,
		},
		{
			provide: LIKES_SERVICE,
			useExisting: LikesService,
		},
	],
	exports: [PostsService, COMMENTS_SERVICE, LIKES_SERVICE],
})
export class PostsModule {}
