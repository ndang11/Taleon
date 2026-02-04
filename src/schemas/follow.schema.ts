import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";

export type FollowDocument = HydratedDocument<Follow>;

@Schema({ timestamps: true })
export class Follow {
	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	followerId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	followingId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: "Tenant", required: true })
	tenantId!: Types.ObjectId;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

// Create compound index for follower + following to prevent duplicate follows
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
