import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Investor' })
  reviewer: MongooseSchema.Types.ObjectId;

  @Prop() rating: number;

  @Prop() content: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
