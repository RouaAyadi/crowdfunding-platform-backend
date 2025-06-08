import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { Campaign, CampaignSchema } from '../campaign/schemas/campaign.schema';
import { Startup, StartupSchema } from '../startup/schemas/startup.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Startup.name, schema: StartupSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    CampaignModule,
  ],
  providers: [BlockchainService],
  controllers: [BlockchainController],
  exports: [BlockchainService],
})
export class BlockchainModule {}
