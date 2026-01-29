import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TenantDocument = HydratedDocument<Tenant>;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true, 
    index: true 
  })
  slug!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);