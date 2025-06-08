import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { StartupModule } from './startup/startup.module';
import { CampaignModule } from './campaign/campaign.module';
import { InvestorModule } from './investor/investor.module';
import { BlockchainModule } from './blockchain/blockchain.module';
declare const process: any;
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';
dotenv.config();


@Module({
  imports: [
    
    MongooseModule.forRoot(process.env.MONGODB_URI ),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    StartupModule,
    CampaignModule,
    InvestorModule,
    BlockchainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
