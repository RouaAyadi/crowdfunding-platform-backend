import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';
import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { campaignStatus } from '../campaign-status.enum';
import { Type } from 'class-transformer';

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @IsEnum(campaignStatus)
  @IsOptional()
  status?: campaignStatus;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  currentAmount?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  backers?: number;
}
