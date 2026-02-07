import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
	@Prop({ required: true, trim: true })
	title!: string;

	@Prop({ trim: true })
	subtitle?: string;

	@Prop({ type: String, required: true })
	content!: string;

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

	@Prop({ default: 0 })
	viewCount!: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
