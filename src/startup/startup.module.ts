import { Module } from '@nestjs/common';
import { StartupController } from './startup.controller';
import { StartupService } from './startup.service';
import { Startup, StartupSchema } from './schemas/startup.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Campaign, CampaignSchema } from '../campaign/schemas/campaign.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Startup.name, schema: StartupSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Campaign.name, schema: CampaignSchema }
    ]),
    AuthModule,
  ],
  controllers: [StartupController],
  providers: [StartupService],
  exports: [StartupService]
})
export class StartupModule {}
