import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Review, ReviewSchema } from './review.schema';
import { Roles } from 'src/auth/roles.enum';

@Schema()
export class Startup extends User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  firstFundedDate: Date;

  @Prop()
  website?: string;

  @Prop()
  logoUrl?: string;

  @Prop({ required: true })
  bio: string;

  @Prop({ type: [String], required: true })
  missionGoals: string[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Campaign' })
  campaigns: MongooseSchema.Types.ObjectId[];

  @Prop([ReviewSchema])
  reviews: Review[];

  // constructor() {
  //   super();
  //   this.role = Roles.STARTUP;
  // }
}

export const StartupSchema = SchemaFactory.createForClass(Startup);

export type StartupDocumentOverride = {
  reviews: Types.DocumentArray<Review>;
};

export type StartupDocument = HydratedDocument<
  Startup,
  StartupDocumentOverride
>;
