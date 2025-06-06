import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { campaignStatus } from '../campaign-status.enum';
import { CommentSchema } from './comment.schema';

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Startup', required: true })
  startup: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 0 })
  targetAmount: number;

  @Prop({ default: 0, min: 0 })
  currentAmount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ enum: campaignStatus, type: String, default: campaignStatus.ACTIVE })
  status: campaignStatus;

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  // New properties for frontend compatibility
  @Prop({ required: true })
  address: string; // Blockchain wallet address for donations

  @Prop()
  image: string; // Campaign image URL

  @Prop({ type: [String], default: [] })
  tags: string[]; // Campaign tags/categories

  @Prop({ default: 0, min: 0 })
  backers: number; // Number of people who backed this campaign
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

export type CampaignDocumentOverride = {
  comments: Types.DocumentArray<Comment>;
};

export type CampaignDocument = HydratedDocument<
  Campaign,
  CampaignDocumentOverride
>;
