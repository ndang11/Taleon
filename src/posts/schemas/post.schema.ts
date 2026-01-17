import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Post extends Document {
	@Prop({ required: true })
	title!: string;

	@Prop({ required: true, unique: true })
	slug!: string;

	@Prop({ required: true })
	content!: string;

	@Prop({ type: Types.ObjectId, ref: "Tenant", required: true, index: true })
	tenantId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	authorId!: Types.ObjectId;

	@Prop({ default: false })
	published!: boolean;

	constructor(partial: Partial<Post>) {
		super();
		Object.assign(this, partial);
	}
}

export const PostSchema = SchemaFactory.createForClass(Post);
