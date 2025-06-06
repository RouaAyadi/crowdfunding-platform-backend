import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCampaignDto } from './dto/query-campaign.dto';
import { campaignStatus } from './campaign-status.enum';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<CampaignDocument> {
    // Validate dates
    const startDate = new Date(createCampaignDto.startDate);
    const endDate = new Date(createCampaignDto.endDate);
    const now = new Date();

    if (startDate < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const campaign = new this.campaignModel({
      ...createCampaignDto,
      startDate,
      endDate,
      currentAmount: 0,
      backers: 0,
      status: campaignStatus.ACTIVE,
    });

    return campaign.save();
  }

  async findAll(queryDto: QueryCampaignDto): Promise<{ campaigns: CampaignDocument[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, search, status, startup, sortBy = 'createdAt', sortOrder = 'desc', tags } = queryDto;

    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Startup filter
    if (startup) {
      filter.startup = startup;
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [campaigns, total] = await Promise.all([
      this.campaignModel
        .find(filter)
        .populate('startup', 'name logoUrl')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.campaignModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      campaigns,
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: string): Promise<CampaignDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid campaign ID');
    }

    const campaign = await this.campaignModel
      .findById(id)
      .populate('startup', 'name logoUrl location bio')
      .populate('comments.author', 'nickname')
      .exec();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto, userId: string): Promise<CampaignDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid campaign ID');
    }

    const campaign = await this.campaignModel.findById(id).populate('startup').exec();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check if user is the owner of the startup
    if (campaign.startup.toString() !== userId) {
      throw new ForbiddenException('You can only update your own campaigns');
    }

    // Validate dates if provided
    if (updateCampaignDto.startDate || updateCampaignDto.endDate) {
      const startDate = updateCampaignDto.startDate ? new Date(updateCampaignDto.startDate) : campaign.startDate;
      const endDate = updateCampaignDto.endDate ? new Date(updateCampaignDto.endDate) : campaign.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      updateCampaignDto.startDate = startDate.toISOString();
      updateCampaignDto.endDate = endDate.toISOString();
    }

    const updatedCampaign = await this.campaignModel
      .findByIdAndUpdate(id, updateCampaignDto, { new: true })
      .populate('startup', 'name logoUrl')
      .exec();

    if (!updatedCampaign) {
      throw new NotFoundException('Campaign not found after update');
    }

    return updatedCampaign;
  }

  async remove(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid campaign ID');
    }

    const campaign = await this.campaignModel.findById(id).populate('startup').exec();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check if user is the owner of the startup
    if (campaign.startup.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own campaigns');
    }

    await this.campaignModel.findByIdAndDelete(id);
  }

  // Comment methods
  async addComment(campaignId: string, createCommentDto: CreateCommentDto): Promise<CampaignDocument> {
    if (!Types.ObjectId.isValid(campaignId)) {
      throw new BadRequestException('Invalid campaign ID');
    }

    const campaign = await this.campaignModel.findById(campaignId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const comment = {
      author: new Types.ObjectId(createCommentDto.author),
      text: createCommentDto.text,
      isEdited: false,
    };

    campaign.comments.push(comment as any);
    await campaign.save();

    const updatedCampaign = await this.campaignModel
      .findById(campaignId)
      .populate('startup', 'name logoUrl')
      .populate('comments.author', 'nickname')
      .exec();

    if (!updatedCampaign) {
      throw new NotFoundException('Campaign not found after adding comment');
    }

    return updatedCampaign;
  }

  async updateComment(campaignId: string, commentId: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<CampaignDocument> {
    if (!Types.ObjectId.isValid(campaignId) || !Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Invalid campaign or comment ID');
    }

    const campaign = await this.campaignModel.findById(campaignId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const comment = campaign.comments.id(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is the author of the comment
    if ((comment as any).author.toString() !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    (comment as any).text = updateCommentDto.text;
    (comment as any).isEdited = true;
    (comment as any).editedAt = new Date();

    await campaign.save();

    const updatedCampaign = await this.campaignModel
      .findById(campaignId)
      .populate('startup', 'name logoUrl')
      .populate('comments.author', 'nickname')
      .exec();

    if (!updatedCampaign) {
      throw new NotFoundException('Campaign not found after updating comment');
    }

    return updatedCampaign;
  }

  async deleteComment(campaignId: string, commentId: string, userId: string): Promise<CampaignDocument> {
    if (!Types.ObjectId.isValid(campaignId) || !Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Invalid campaign or comment ID');
    }

    const campaign = await this.campaignModel.findById(campaignId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const comment = campaign.comments.id(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is the author of the comment
    if ((comment as any).author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    campaign.comments.pull(commentId);
    await campaign.save();

    const updatedCampaign = await this.campaignModel
      .findById(campaignId)
      .populate('startup', 'name logoUrl')
      .populate('comments.author', 'nickname')
      .exec();

    if (!updatedCampaign) {
      throw new NotFoundException('Campaign not found after deleting comment');
    }

    return updatedCampaign;
  }

  async getCampaignStats(campaignId: string): Promise<any> {
    if (!Types.ObjectId.isValid(campaignId)) {
      throw new BadRequestException('Invalid campaign ID');
    }

    const campaign = await this.campaignModel.findById(campaignId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const startDate = new Date(campaign.startDate);

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const progressPercentage = Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100);

    return {
      id: campaign._id,
      title: campaign.title,
      description: campaign.description,
      targetAmount: campaign.targetAmount,
      currentAmount: campaign.currentAmount,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      backers: campaign.backers,
      daysLeft,
      totalDays,
      status: campaign.status,
      commentsCount: campaign.comments.length,
    };
  }

  async updateCampaignAmount(campaignId: string, amount: number): Promise<CampaignDocument> {
    if (!Types.ObjectId.isValid(campaignId)) {
      throw new BadRequestException('Invalid campaign ID');
    }

    const campaign = await this.campaignModel.findById(campaignId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    campaign.currentAmount += amount;
    campaign.backers += 1;

    // Update status if target reached
    if (campaign.currentAmount >= campaign.targetAmount) {
      campaign.status = campaignStatus.FUNDED;
    }

    return campaign.save();
  }
}
