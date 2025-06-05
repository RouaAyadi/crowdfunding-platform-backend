import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Roles } from '../roles.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ discriminatorKey: 'role', timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  walletAddress: string;

  @Prop({ enum: Roles, required: true })
  role: Roles;
}

export const UserSchema = SchemaFactory.createForClass(User);
