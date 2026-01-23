import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";
import { PostStatus } from "../dto/create-post.dto";

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
	@Prop({ required: true, trim: true })
	title!: string;

	@Prop({ required: true, unique: true })
	slug!: string;

	@Prop({ required: true })
	content!: string;

	@Prop({ required: true })
	category!: string;

	@Prop({
		type: String,
		enum: Object.values(PostStatus),
		default: PostStatus.DRAFT,
	})
	status!: PostStatus;

	@Prop({ required: false })
	imageUrl?: string;

	@Prop({
		type: Types.ObjectId,
		ref: "User",
		required: true,
	})
	authorId!: Types.ObjectId;

	@Prop({
		type: Types.ObjectId,
		required: true,
		index: true,
	})
	tenantId!: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
