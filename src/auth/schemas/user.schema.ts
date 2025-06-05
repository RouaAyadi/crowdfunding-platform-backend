import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Roles } from '../roles.enum';

export type UserDocument = User & Document;

@Schema({
  discriminatorKey: 'role',
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  walletAddress: string;

  @Prop()
  nonce?: string;

  // @Prop({ required: true, enum: Roles, type: String })
  @Prop({ required: true, enum: ['investor', 'startup'] })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
