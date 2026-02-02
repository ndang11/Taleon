import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";
import type { PostContent } from "src/interfaces/post.type";

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
	@Prop({ required: true, trim: true })
	title!: string;

	@Prop({ trim: true })
	subtitle?: string;

	@Prop({ type: Object, required: true })
	content!: PostContent;

	@Prop({ unique: true, index: true })
	slug!: string;

	@Prop({ default: "draft", enum: ["draft", "published"], index: true })
	status!: string;

	@Prop()
	publishedAt?: Date;

	@Prop()
	coverImage?: string;

	@Prop({ default: 0 })
	wordCount!: number;

	@Prop({ default: 0 })
	readingTime!: number;

	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	authorId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: "Tenant", required: true, index: true })
	tenantId!: Types.ObjectId;

	@Prop({ type: [String], default: [] })
	tags!: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
