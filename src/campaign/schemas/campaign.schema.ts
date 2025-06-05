import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { campaignStatus } from '../campaign-status.enum';
import { CommentSchema } from './comment.schema';

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Startup' })
  startup: MongooseSchema.Types.ObjectId;

  @Prop()
  targetAmount: number;

  @Prop()
  currentAmount: number;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ enum: campaignStatus, type: String, default: campaignStatus.ACTIVE })
  status: campaignStatus;

  @Prop({ type: [CommentSchema] })
  comments: Comment[];
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

export type CampaignDocumentOverride = {
  comments: Types.DocumentArray<Comment>;
};

export type CampaignDocument = HydratedDocument<
  Campaign,
  CampaignDocumentOverride
>;
