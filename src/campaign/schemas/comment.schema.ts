import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Investor' })
  author: MongooseSchema.Types.ObjectId;

  @Prop() text: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
