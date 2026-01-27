import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { ImageKitModule } from "../imagekit/imagekit.module";
import { Post } from "../models/post.model";
import { MultiTenantModule } from "../multi-tenant/multi-tenant.module";
import { TenantsModule } from "../tenants/tenants.module";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Post.name, schema: Post.schema }]),
		ImageKitModule,
		AuthModule,
		MultiTenantModule,
		TenantsModule,
	],
	controllers: [PostsController],
	providers: [PostsService],
	exports: [PostsService],
})
export class PostsModule {}
