import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StartupDocument, Startup } from './schemas/startup.schema';
import { Campaign } from '../campaign/schemas/campaign.schema';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { StartupResponseDto } from './dto/startup-response.dto';
import { LaunchCampaignDto } from './dto/launch-campaign.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class StartupService {
  constructor(
    @InjectModel(Startup.name) private startupModel: Model<StartupDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
  ) {}

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }
  }

  async findAll(): Promise<StartupResponseDto[]> {
    const startups = await this.startupModel
      .find()
      .populate('campaigns')
      .populate({
        path: 'reviews.reviewer',
        select: 'name avatar'
      })
      .exec();

    return startups.map(startup =>
      plainToClass(StartupResponseDto, startup.toObject(), {
        excludeExtraneousValues: true,
      })
    );
  }

  async findOne(id: string): Promise<StartupResponseDto> {
    this.validateObjectId(id);

    const startup = await this.startupModel
      .findById(id)
      .populate('campaigns')
      .populate({
        path: 'reviews.reviewer',
        select: 'name avatar'
      })
      .exec();

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    return plainToClass(StartupResponseDto, startup.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async findByWalletAddress(walletAddress: string): Promise<StartupResponseDto> {
    const startup = await this.startupModel
      .findOne({ walletAddress: walletAddress.toLowerCase() })
      .populate('campaigns')
      .populate({
        path: 'reviews.reviewer',
        select: 'name avatar'
      })
      .exec();

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    return plainToClass(StartupResponseDto, startup.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, updateStartupDto: UpdateStartupDto, userId: string): Promise<StartupResponseDto> {
    this.validateObjectId(id);

    const startup = await this.startupModel.findById(id);
    
    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    // Verify ownership
    if (startup.walletAddress !== userId) {
      throw new ForbiddenException('You can only update your own startup profile');
    }

    const updatedStartup = await this.startupModel
      .findByIdAndUpdate(id, updateStartupDto, { new: true })
      .populate('campaigns')
      .populate({
        path: 'reviews.reviewer',
        select: 'name avatar'
      })
      .exec();

    if (!updatedStartup) {
      throw new NotFoundException('Startup not found after update');
    }

    return plainToClass(StartupResponseDto, updatedStartup.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async getDashboardStats(id: string): Promise<any> {
    this.validateObjectId(id);

    const startup = await this.startupModel
      .findById(id)
      .populate({
        path: 'campaigns',
        select: 'status currentAmount createdAt'
      })
      .populate('reviews')
      .exec();

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    const response = plainToClass(StartupResponseDto, startup.toObject(), {
      excludeExtraneousValues: true,
    });

    // Get active campaigns
    const activeCampaigns = (startup.campaigns as any[]).filter(campaign => campaign.status === 'active');
    
    // Calculate monthly funding trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyFunding = await this.campaignModel.aggregate([
      {
        $match: {
          startup: startup._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalFunding: { $sum: "$currentAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return {
      overview: {
        totalFundsRaised: response.totalFundsRaised,
        activeCampaigns: response.activeCampaigns,
        completedCampaigns: response.completedCampaigns,
        averageRating: response.averageRating
      },
      activeCampaigns: activeCampaigns.length,
      monthlyFundingTrend: monthlyFunding,
      recentReviews: startup.reviews.slice(-5), // Last 5 reviews
    };
  }

  async getStartupCampaigns(id: string, status?: string): Promise<Campaign[]> {
    this.validateObjectId(id);

    const query = this.campaignModel.find({ startup: id });
    
    if (status) {
      query.where('status').equals(status);
    }
    
    return query.sort({ createdAt: -1 }).exec();
  }

  async launchCampaign(startupId: string, launchCampaignDto: LaunchCampaignDto): Promise<Campaign> {
    this.validateObjectId(startupId);

    const startup = await this.startupModel.findById(startupId);
    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    // Create new campaign
    const campaign = new this.campaignModel({
      ...launchCampaignDto,
      startup: startupId,
      status: 'active',
      currentAmount: 0,
      backers: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the campaign
    const savedCampaign = await campaign.save();

    // Add campaign to startup's campaigns array
    await this.startupModel.findByIdAndUpdate(startupId, {
      $push: { campaigns: savedCampaign._id }
    });

    return savedCampaign;
  }
}
