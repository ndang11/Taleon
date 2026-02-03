// src/posts/posts.module.ts
import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { CommentsModule } from "../comments/comments.module";
import { LikesModule } from "../likes/likes.module";
import { Post, PostSchema } from "../schemas/post.schema";
import { TenantsModule } from "../tenants/tenants.module";
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
	providers: [PostsService],
	exports: [PostsService],
})
export class PostsModule {}
