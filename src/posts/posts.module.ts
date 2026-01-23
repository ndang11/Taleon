import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { jwtConstants } from "../auth/constants";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { Post, PostSchema } from "./schemas/post.schema";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
		AuthModule,
		CloudinaryModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: "7d" },
		}),
	],
	controllers: [PostsController],
	providers: [PostsService],
})
export class PostsModule {}
