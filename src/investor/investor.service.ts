import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Types } from 'mongoose';
import { Investor, InvestorDocument } from './schemas/investor.schema';
import { plainToClass } from 'class-transformer';
import { InvestorResponseDto } from './dto/investor-response.dto';
import { AddInvestmentDto } from './dto/add-investment.dto';
import { Campaign } from '../campaign/schemas/campaign.schema';

@Injectable()
export class InvestorService {
  constructor(
    @InjectModel(Investor.name) private investorModel: Model<InvestorDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
  ) {}

  async findAll(): Promise<InvestorResponseDto[]> {
    const investors = await this.investorModel
      .find()
      .populate({
        path: 'investments',
        select: 'currentAmount status'
      })
      .exec();

    return investors.map(investor => 
      plainToClass(InvestorResponseDto, investor.toObject(), { 
        excludeExtraneousValues: true 
      })
    );
  }

  async findOne(id: string): Promise<InvestorResponseDto> {
    const investor = await this.investorModel
      .findById(id)
      .populate({
        path: 'investments',
        select: 'currentAmount status'
      })
      .exec();

    if (!investor) {
      throw new NotFoundException('Investor not found');
    }

    return plainToClass(InvestorResponseDto, investor.toObject(), { 
      excludeExtraneousValues: true 
    });
  }

  async findByWalletAddress(walletAddress: string): Promise<InvestorResponseDto> {
    const investor = await this.investorModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .populate({
        path: 'investments',
        select: 'currentAmount status'
      })
      .exec();

    if (!investor) {
      throw new NotFoundException('Investor not found');
    }

    return plainToClass(InvestorResponseDto, investor.toObject(), { 
      excludeExtraneousValues: true 
    });
  }

  async getInvestorStats(id: string) {
    const investor = await this.investorModel
      .findById(id)
      .populate({
        path: 'investments',
        select: 'currentAmount status'
      })
      .exec();

    if (!investor) {
      throw new NotFoundException('Investor not found');
    }

    const response = plainToClass(InvestorResponseDto, investor.toObject(), { 
      excludeExtraneousValues: true 
    });

    return {
      totalInvested: response.totalInvested,
      totalCampaigns: response.totalCampaigns,
      successfulStartups: response.successfulStartups
    };
  }

  async addInvestment(investorId: string, addInvestmentDto: AddInvestmentDto): Promise<InvestorResponseDto> {
    const { campaignId, amount } = addInvestmentDto;

    // Find the investor
    const investor = await this.investorModel.findById(investorId);
    if (!investor) {
      throw new NotFoundException('Investor not found');
    }

    // Find the campaign
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Validate campaign status
    if (campaign.status !== 'active') {
      throw new BadRequestException('Campaign is not active');
    }

    // Check if investor has already invested in this campaign
    const hasInvested = investor.investments.some(
      investmentId => investmentId.toString() === campaignId
    );

    if (hasInvested) {
      // Update only the campaign amount
      await this.campaignModel.findByIdAndUpdate(campaignId, {
        $inc: { currentAmount: amount }
      });
    } else {
      // Add new investment to investor's investments array
      await this.investorModel.findByIdAndUpdate(investorId, {
        $push: { investments: new Types.ObjectId(campaignId) }
      });

      // Update campaign amount and backers
      await this.campaignModel.findByIdAndUpdate(campaignId, {
        $inc: { currentAmount: amount, backers: 1 }
      });
    }

    // Return updated investor data
    const updatedInvestor = await this.investorModel
      .findById(investorId)
      .populate({
        path: 'investments',
        select: 'currentAmount status'
      })
      .exec();

    if (!updatedInvestor) {
      throw new NotFoundException('Investor not found after update');
    }

    return plainToClass(InvestorResponseDto, updatedInvestor.toObject(), { 
      excludeExtraneousValues: true 
    });
  }
}
