import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CommentsModule } from "./comments/comments.module";
import { FollowsModule } from "./follows/follows.module";
import { HealthController } from "./health/health.controller";
import { LikesModule } from "./likes/likes.module";
import { MultiTenantModule } from "./multi-tenant/multi-tenant.module";
import { PostsModule } from "./posts/posts.module";
import { TenantsModule } from "./tenants/tenants.module";
import { UploadModule } from "./upload/upload.module";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),

		MongooseModule.forRoot(process.env.MONGO_URI as string),

		AuthModule,
		UsersModule,
		TenantsModule,
		MultiTenantModule,
		PostsModule,
		CommentsModule,
		LikesModule,
		FollowsModule,
		UploadModule,
	],
	controllers: [AppController, HealthController],
	providers: [AppService],
})
export class AppModule {}
