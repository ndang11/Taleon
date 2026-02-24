import { model, Schema } from "mongoose";

export interface IUser {
	name: string;
	email: string;
	password: string;
}

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			index: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
	},
	{ timestamps: true },
);

export const User = model<IUser>("User", userSchema);
