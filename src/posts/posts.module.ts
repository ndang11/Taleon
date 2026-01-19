import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { jwtConstants } from "../auth/constants";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { Post, PostSchema } from "./schemas/post.schema";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: "7d" },
		}),
	],
	controllers: [PostsController],
	providers: [PostsService, JwtAuthGuard],
})
export class PostsModule {}
