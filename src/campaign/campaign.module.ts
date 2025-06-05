import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  providers: [CampaignService],
  controllers: [CampaignController],
})
export class CampaignModule {}
