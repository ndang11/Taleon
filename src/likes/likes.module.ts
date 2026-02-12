import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Schema } from "mongoose";
import { MultiTenantModule } from "../multi-tenant/multi-tenant.module";
import { PostsModule } from "../posts/posts.module";
import { LikesController } from "./likes.controller";
import { LikesService } from "./likes.service";

// Create a new schema that explicitly has content as optional
const FixedLikeSchema = new Schema(
	{
		postId: {
			type: Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		tenantId: {
			type: String,
			required: true,
			index: true,
		},
		content: {
			type: String,
			required: false,
			default: undefined,
		},
	},
	{ timestamps: true },
);

FixedLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "Like", schema: FixedLikeSchema }]),
		forwardRef(() => MultiTenantModule),
		forwardRef(() => PostsModule),
	],
	controllers: [LikesController],
	providers: [LikesService],
	exports: [LikesService],
})
export class LikesModule {}
