import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Review, ReviewSchema } from './review.schema';

@Schema()
export class Startup extends User {
  @Prop({ required: true })
  startupName: string;

  @Prop()
  location: string;

  @Prop()
  firstFundedDate: Date;

  @Prop()
  website: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  bio: string;

  @Prop({ type: [String] })
  missionGoals: string[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Campaign' })
  campaigns: MongooseSchema.Types.ObjectId[];

  @Prop([ReviewSchema])
  reviews: Review[];
}

export const StartupSchema = SchemaFactory.createForClass(Startup);

export type StartupDocumentOverride = {
  reviews: Types.DocumentArray<Review>;
};

export type StartupDocument = HydratedDocument<
  Startup,
  StartupDocumentOverride
>;
