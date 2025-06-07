import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvestorController } from './investor.controller';
import { InvestorService } from './investor.service';
import { AuthModule } from 'src/auth/auth.module';
import { Investor, InvestorSchema } from './schemas/investor.schema';
import { Campaign, CampaignSchema } from '../campaign/schemas/campaign.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investor.name, schema: InvestorSchema },
      { name: Campaign.name, schema: CampaignSchema }
    ]),
    AuthModule
  ],
  controllers: [InvestorController],
  providers: [InvestorService],
  exports: [InvestorService, MongooseModule]
})
export class InvestorModule {}
