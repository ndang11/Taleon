import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {  Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true })
	name!: string;

	@Prop({ required: true, unique: true, lowercase: true })
	email!: string;

	@Prop({ required: true, select: false })
	password!: string;

	@Prop({ type: Types.ObjectId, ref: "Tenant", required: true })
	tenantId!: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
