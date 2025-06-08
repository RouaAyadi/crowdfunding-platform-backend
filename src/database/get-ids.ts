import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocument } from '../campaign/schemas/campaign.schema';
import { Startup, StartupDocument } from '../startup/schemas/startup.schema';
import { Investor, InvestorDocument } from '../investor/schemas/investor.schema';

async function getIds() {
  const logger = new Logger('GetIds');
  
  try {
    logger.log('Getting all IDs from database...');
    
    const app = await NestFactory.createApplicationContext(SeederModule);
    
    // Get models directly from the app context
    const campaignModel = app.get<Model<CampaignDocument>>('CampaignModel');
    const startupModel = app.get<Model<StartupDocument>>('StartupModel');
    const investorModel = app.get<Model<InvestorDocument>>('InvestorModel');
    
    // Get all startups with their IDs
    const startups = await startupModel.find().select('_id name').exec();
    logger.log(`\n🚀 STARTUP IDs:`);
    startups.forEach((startup, index) => {
      logger.log(`${index + 1}. ${startup.name}: ${startup._id}`);
    });
    
    // Get all campaigns with their IDs
    const campaigns = await campaignModel.find().select('_id title').exec();
    logger.log(`\n📊 CAMPAIGN IDs:`);
    campaigns.forEach((campaign, index) => {
      logger.log(`${index + 1}. ${campaign.title}: ${campaign._id}`);
    });
    
    // Get all investors with their IDs
    const investors = await investorModel.find().select('_id name').exec();
    logger.log(`\n💰 INVESTOR IDs:`);
    investors.forEach((investor, index) => {
      logger.log(`${index + 1}. ${investor.name}: ${investor._id}`);
    });
    
    logger.log(`\n✅ Use these ObjectIds in your frontend URLs!`);
    
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to get IDs:', error);
    process.exit(1);
  }
}

getIds();
