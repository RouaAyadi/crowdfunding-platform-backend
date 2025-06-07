import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Review, ReviewSchema } from './review.schema';
import { SocialLinks, KeyMetric, Milestone } from '../interfaces/startup.interface';

@Schema()
export class Startup extends User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  logo?: string;

  @Prop()
  coverImage?: string;

  @Prop({ required: true })
  field: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  longDescription?: string;

  @Prop({ type: [String], required: true })
  motives: string[];

  @Prop({ required: true })
  foundedYear: number;

  @Prop({ required: true })
  teamSize: number;

  @Prop()
  website?: string;

  @Prop({ type: Object })
  socialLinks?: SocialLinks;

  @Prop({ type: [{ label: String, value: String }] })
  keyMetrics?: KeyMetric[];

  @Prop({ type: [{ 
    title: String,
    description: String,
    date: Date,
    completed: Boolean
  }] })
  milestones?: Milestone[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Campaign' })
  campaigns: MongooseSchema.Types.ObjectId[];

  @Prop([ReviewSchema])
  reviews: Review[];

  @Prop()
  firstFundedDate?: Date;

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
