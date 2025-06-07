import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Roles } from '../../auth/roles.enum';

export type InvestorDocument = Investor & Document;

@Schema()
export class Investor extends User {
  @Prop({ required: true })
  name: string;

  @Prop()
  nickname?: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Campaign' })
  investments: MongooseSchema.Types.ObjectId[];

  // constructor() {
  //   super();
  //   this.role = Roles.INVESTOR;
  // }
}

export const InvestorSchema = SchemaFactory.createForClass(Investor);
