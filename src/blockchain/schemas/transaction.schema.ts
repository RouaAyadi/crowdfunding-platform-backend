import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

export enum TransactionType {
  CONTRIBUTION = 'contribution',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
  CAMPAIGN_CREATION = 'campaign_creation',
  MILESTONE_COMPLETION = 'milestone_completion',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  txHash: string;

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Prop({ required: true })
  fromAddress: string;

  @Prop({ required: true })
  toAddress: string;

  @Prop({ required: true })
  amount: string; // Store as string to handle big numbers

  @Prop({ required: true })
  gasUsed: string;

  @Prop({ required: true })
  gasPrice: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Campaign' })
  campaignId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Startup' })
  startupId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Investor' })
  investorId?: MongooseSchema.Types.ObjectId;

  @Prop()
  milestoneIndex?: number;

  @Prop()
  contractAddress?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  errorMessage?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
