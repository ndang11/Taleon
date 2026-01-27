import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type TenantDocument = HydratedDocument<Tenant>;

@Schema({ timestamps: true })
export class Tenant {
	@Prop({ required: true, unique: true, index: true })
	name!: string;

	@Prop({
		required: true,
		unique: true,
		lowercase: true,
		index: true,
	})
	slug!: string;

	@Prop({
		type: Types.ObjectId,
		ref: User.name,
		required: false,
	})
	ownerId?: Types.ObjectId;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
