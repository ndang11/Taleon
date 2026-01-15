import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";
import { Tenant } from "../tenants/schemas/tenant.schema";
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true })
	name!: string;

	@Prop({
		required: true,
		unique: true,
		lowercase: true,
		index: true,
	})
	email!: string;

	@Prop({ required: true, select: false })
	password!: string;

	@Prop({
		type: Types.ObjectId,
		ref: Tenant.name,
		required: true,
		index: true,
	})
	tenantId!: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
