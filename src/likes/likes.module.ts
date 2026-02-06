import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Like, LikeSchema } from "../models/like.model";
import { MultiTenantModule } from "../multi-tenant/multi-tenant.module";
import { PostsModule } from "../posts/posts.module";
import { LikesController } from "./likes.controller";
import { LikesService } from "./likes.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
		MultiTenantModule,
		forwardRef(() => PostsModule),
	],
	controllers: [LikesController],
	providers: [LikesService],
	exports: [LikesService],
})
export class LikesModule {}
