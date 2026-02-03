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

	// Profile fields
	@Prop({ default: "" })
	bio!: string;

	@Prop({ default: "" })
	avatar!: string;

	@Prop({ default: "" })
	coverImage!: string;

	@Prop({ default: "" })
	location!: string;

	@Prop({ default: "" })
	website!: string;

	@Prop({ default: "" })
	phone!: string;

	@Prop({ default: 0 })
	followersCount!: number;

	@Prop({ default: 0 })
	followingCount!: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
