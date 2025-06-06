import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCampaignDto } from './dto/query-campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    return this.campaignService.create(createCampaignDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryCampaignDto) {
    return this.campaignService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.campaignService.findOne(id);
  }

  @Get(':id/stats')
  async getCampaignStats(@Param('id') id: string) {
    return this.campaignService.getCampaignStats(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Request() req
  ) {
    return this.campaignService.update(id, updateCampaignDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.campaignService.remove(id, req.user.userId);
  }

  // Comment endpoints
  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('id') campaignId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any
  ) {
    const commentDto = { ...createCommentDto, author: req.user.userId };
    return this.campaignService.addComment(campaignId, commentDto);
  }

  @Patch(':campaignId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('campaignId') campaignId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: any
  ) {
    return this.campaignService.updateComment(campaignId, commentId, updateCommentDto, req.user.userId);
  }

  @Delete(':campaignId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('campaignId') campaignId: string,
    @Param('commentId') commentId: string,
    @Request() req: any
  ) {
    return this.campaignService.deleteComment(campaignId, commentId, req.user.userId);
  }

  @Patch(':id/amount')
  @UseGuards(JwtAuthGuard)
  async updateAmount(
    @Param('id') id: string,
    @Body('amount') amount: number
  ) {
    return this.campaignService.updateCampaignAmount(id, amount);
  }
}
