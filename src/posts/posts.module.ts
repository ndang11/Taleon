import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MultiTenantModule } from "../multi-tenant/multi-tenant.module";
import { POST_MODEL, Post, PostSchema } from "./post.schema";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: POST_MODEL, schema: PostSchema }]),
		MultiTenantModule,
	],
	controllers: [PostsController],
	providers: [PostsService],
})
export class PostsModule {}
