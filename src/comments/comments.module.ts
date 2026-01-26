import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { Comment } from "../models/comment.model";
import { MultiTenantModule } from "../multi-tenant/multi-tenant.module";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Comment.name, schema: Comment.schema }]),
		AuthModule,
		MultiTenantModule,
	],
	controllers: [CommentsController],
	providers: [CommentsService],
	exports: [CommentsService],
})
export class CommentsModule {}
