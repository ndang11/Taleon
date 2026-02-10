import {
	type Document,
	model,
	Schema,
	type SchemaDefinitionProperty,
	type Types,
} from "mongoose";

export interface ILike extends Document {
	postId: Types.ObjectId;
	userId: Types.ObjectId;
	tenantId: string;
	content?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LikeSchemaDefinition {
	postId: SchemaDefinitionProperty<Types.ObjectId, ILike>;
	userId: SchemaDefinitionProperty<Types.ObjectId, ILike>;
	tenantId: SchemaDefinitionProperty<string, ILike>;
	content?: SchemaDefinitionProperty<string | undefined, ILike>;
}

const likeSchema = new Schema<ILike, unknown, LikeSchemaDefinition>(
	{
		postId: {
			type: Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		tenantId: {
			type: String,
			required: true,
			index: true,
		},
		content: {
			type: String,
			required: false,
			default: undefined,
		},
	},
	{ timestamps: true },
);

// Compound index to ensure a user can like a post only once
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = model<ILike>("Like", likeSchema);
export const LikeSchema: Schema<ILike, any, any, any> = likeSchema;
