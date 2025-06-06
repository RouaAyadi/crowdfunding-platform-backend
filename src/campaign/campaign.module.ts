import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Startup, StartupSchema } from 'src/startup/schemas/startup.schema';
import { Investor, InvestorSchema } from 'src/investor/schemas/investor.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Startup.name, schema: StartupSchema },
      { name: Investor.name, schema: InvestorSchema },
    ]),
    AuthModule,
  ],
  providers: [CampaignService],
  controllers: [CampaignController],
  exports: [CampaignService],
})
export class CampaignModule {}
