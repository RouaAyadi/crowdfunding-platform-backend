import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Investor', required: true })
  author: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, minlength: 1, maxlength: 1000 })
  text: string;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop()
  editedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
