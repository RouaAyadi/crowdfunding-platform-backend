import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// Schemas
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Startup, StartupSchema } from '../startup/schemas/startup.schema';
import { Investor, InvestorSchema } from '../investor/schemas/investor.schema';
import { Campaign, CampaignSchema } from '../campaign/schemas/campaign.schema';
import { Comment, CommentSchema } from '../campaign/schemas/comment.schema';
import { Review, ReviewSchema } from '../startup/schemas/review.schema';

// Services
import { DatabaseSeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/crowdfunding'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: Startup.name,
        schema: StartupSchema,
        discriminators: [
          { name: Startup.name, schema: StartupSchema, value: 'startup' },
        ],
      },
      {
        name: Investor.name,
        schema: InvestorSchema,
        discriminators: [
          { name: Investor.name, schema: InvestorSchema, value: 'investor' },
        ],
      },
      { name: Campaign.name, schema: CampaignSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class SeederModule {}
