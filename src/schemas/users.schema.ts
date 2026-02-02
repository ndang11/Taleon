import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, trim: true })
	name!: string;

	@Prop({
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
		index: true,
	})
	email!: string;

	@Prop({ required: true, select: false })
	password!: string;

	@Prop({ type: Types.ObjectId, ref: "Tenant", required: true })
	tenantId!: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
