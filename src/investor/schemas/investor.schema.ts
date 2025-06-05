import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

export type InvestorDocument = HydratedDocument<Investor>;

@Schema()
export class Investor extends User {
  @Prop()
  nickname: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Campaign' })
  investments: MongooseSchema.Types.ObjectId[];
}

export const InvestorSchema = SchemaFactory.createForClass(Investor);
