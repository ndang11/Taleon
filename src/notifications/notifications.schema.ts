import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
	LIKE = "like",
	COMMENT = "comment",
	FOLLOW = "follow",
	MENTION = "mention",
}

@Schema({ timestamps: true })
export class Notification {
	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	userId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: "User" })
	fromUserId?: Types.ObjectId;

	@Prop({ type: String, enum: NotificationType, required: true })
	type!: NotificationType;

	@Prop({ type: Types.ObjectId, ref: "Post" })
	postId?: Types.ObjectId;

	@Prop({ type: String, required: true })
	message!: string;

	@Prop({ type: Boolean, default: false })
	isRead!: boolean;

	@Prop({ type: String })
	link?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Add index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
